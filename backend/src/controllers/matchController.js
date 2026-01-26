import mongoose from "mongoose";
import { createMatch, updateMatch, getMatches, getMatchById, deleteMatch, getLiveMatches, getUpcomingMatches, getCompletedMatches, getMatchesByTeam } from "../services/matchService.js";
import { recordBall } from "../services/scoringService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { created, ok } from "../config/response.js";
import Match from "../models/Match.js";
import { MATCH_STATUS } from "../config/constants.js";
import { 
  saveLiveScore, 
  getLiveScore as getCachedLiveScore,
  saveLiveState,
  getLiveState,
  saveScoringState,
  getScoringState,
  buildLiveData,
  deleteLiveData
} from "../services/liveScoreCache.js";
import { getRuntime } from "../services/runtime.js";
import { updateAllStatsOnMatchComplete, updatePlayerStatsAfterInnings } from "../services/statsService.js";

export const create = asyncHandler(async (req, res) => {
  const data = await createMatch(req.body);
  return created(res, data, "match_created");
});

export const update = asyncHandler(async (req, res) => {
  const data = await updateMatch(req.params.matchId, req.body);
  return ok(res, data, "match_updated");
});

export const list = asyncHandler(async (req, res) => {
  const data = await getMatches();
  return ok(res, data, "matches");
});

export const liveMatches = asyncHandler(async (req, res) => {
  const data = await getLiveMatches();
  return ok(res, data, "live_matches");
});

export const upcomingMatches = asyncHandler(async (req, res) => {
  const data = await getUpcomingMatches();
  return ok(res, data, "upcoming_matches");
});

export const completedMatches = asyncHandler(async (req, res) => {
  const data = await getCompletedMatches();
  return ok(res, data, "completed_matches");
});

export const matchesByTeam = asyncHandler(async (req, res) => {
  const data = await getMatchesByTeam(req.params.teamId);
  return ok(res, data, "team_matches");
});

export const getById = asyncHandler(async (req, res) => {
  const data = await getMatchById(req.params.matchId);
  return ok(res, data, "match");
});

export const score = asyncHandler(async (req, res) => {
  const data = await recordBall(req.params.matchId, req.body);
  const { io, redis } = getRuntime();

  // Build comprehensive live data
  const liveData = buildLiveData(data.match);
  liveData.lastBall = data.ball;

  if (redis?.pubClient) {
    // Save both simple score and full live state
    await saveLiveScore(redis.pubClient, req.params.matchId, liveData);
    await saveLiveState(redis.pubClient, req.params.matchId, liveData);
  }
  
  if (io) {
    // Broadcast full live data to all public clients
    io.of("/public").to(req.params.matchId).emit("score:update", liveData);
    // Also emit to global for match list updates
    io.of("/public").emit("score:update", liveData);
  }
  
  return ok(res, data, "score_recorded");
});

export const getLiveScore = asyncHandler(async (req, res) => {
  const { redis } = getRuntime();
  const matchId = req.params.matchId;
  
  // Try to get from cache first
  if (redis?.pubClient) {
    const cached = await getLiveState(redis.pubClient, matchId);
    if (cached) return ok(res, cached, "live_score");
  }
  
  // Fall back to database
  const match = await Match.findById(matchId)
    .populate('teamA', 'name shortName logo primaryColor')
    .populate('teamB', 'name shortName logo primaryColor')
    .lean();
    
  if (!match) return ok(res, null, "match_not_found");
  
  // Build and cache the live data
  const liveData = buildLiveData(match);
  
  if (redis?.pubClient) {
    await saveLiveState(redis.pubClient, matchId, liveData);
  }
  
  return ok(res, liveData, "live_score");
});

// Get full live match state (for viewers after refresh)
export const getFullLiveState = asyncHandler(async (req, res) => {
  const { redis } = getRuntime();
  const matchId = req.params.matchId;
  
  // Try cache first
  if (redis?.pubClient) {
    const cached = await getLiveState(redis.pubClient, matchId);
    if (cached) return ok(res, cached, "live_state");
  }
  
  // Build from database
  const match = await Match.findById(matchId)
    .populate('teamA', 'name shortName logo primaryColor')
    .populate('teamB', 'name shortName logo primaryColor')
    .lean();
    
  if (!match) return ok(res, null, "match_not_found");
  
  const liveData = buildLiveData(match);
  
  // Cache for next time
  if (redis?.pubClient && match.status === MATCH_STATUS.LIVE) {
    await saveLiveState(redis.pubClient, matchId, liveData);
  }
  
  return ok(res, liveData, "live_state");
});

// Save scoring state (admin saving progress)
export const saveScoringProgress = asyncHandler(async (req, res) => {
  const { redis } = getRuntime();
  const matchId = req.params.matchId;
  const scoringState = req.body;
  
  if (redis?.pubClient) {
    await saveScoringState(redis.pubClient, matchId, scoringState);
  }
  
  return ok(res, { saved: true }, "scoring_state_saved");
});

// Get scoring state (admin resuming)
export const getScoringProgress = asyncHandler(async (req, res) => {
  const { redis } = getRuntime();
  const matchId = req.params.matchId;
  
  // Try cache first
  let scoringState = null;
  if (redis?.pubClient) {
    scoringState = await getScoringState(redis.pubClient, matchId);
  }
  
  // Also get the match from DB to provide current state
  const match = await Match.findById(matchId)
    .populate('teamA', 'name shortName logo primaryColor')
    .populate('teamB', 'name shortName logo primaryColor')
    .lean();
    
  if (!match) return ok(res, null, "match_not_found");
  
  return ok(res, { 
    scoringState, 
    match,
    liveData: buildLiveData(match)
  }, "scoring_progress");
});

export const remove = asyncHandler(async (req, res) => {
  await deleteMatch(req.params.matchId);
  return ok(res, null, "match_deleted");
});

// Start innings - saves toss, openers, and bowler
export const startInnings = asyncHandler(async (req, res) => {
  const { toss, battingTeamId, bowlingTeamId, openers, bowler } = req.body;
  const matchId = req.params.matchId;
  
  const match = await Match.findById(matchId);
  if (!match) {
    return ok(res, null, "match_not_found");
  }
  
  // Save toss information
  match.toss = {
    winner: toss.winner,
    decision: toss.decision
  };
  
  // Create innings
  const innings = {
    battingTeam: battingTeamId,
    bowlingTeam: bowlingTeamId,
    runs: 0,
    wickets: 0,
    overs: 0,
    runRate: 0,
    batting: openers.map(opener => ({
      player: opener._id,
      name: opener.name,
      runs: 0,
      balls: 0,
      fours: 0,
      sixes: 0,
      isOut: false,
      onStrike: false
    })),
    bowling: [{
      player: bowler._id,
      name: bowler.name,
      overs: 0,
      maidens: 0,
      runs: 0,
      wickets: 0,
      economy: 0
    }],
    currentBatsmen: openers.map((opener, idx) => ({
      player: opener._id,
      name: opener.name,
      runs: 0,
      balls: 0,
      fours: 0,
      sixes: 0,
      isOut: false,
      onStrike: idx === 0
    })),
    currentBowler: {
      player: bowler._id,
      name: bowler.name,
      overs: 0,
      maidens: 0,
      runs: 0,
      wickets: 0,
      economy: 0
    },
    recentBalls: []
  };
  
  match.innings.push(innings);
  match.currentInnings = match.innings.length;
  match.status = MATCH_STATUS.LIVE;
  
  await match.save();
  
  const { io } = getRuntime();
  if (io) {
    io.of("/public").emit("match:started", { matchId, match });
  }
  
  return ok(res, match, "innings_started");
});

// Change bowler
export const changeBowler = asyncHandler(async (req, res) => {
  const { bowler, previousBowlerStats } = req.body;
  const matchId = req.params.matchId;
  
  const match = await Match.findById(matchId);
  if (!match) {
    return ok(res, null, "match_not_found");
  }
  
  const inningsIndex = match.currentInnings - 1;
  const innings = match.innings[inningsIndex];
  
  if (!innings) {
    return ok(res, null, "no_active_innings");
  }
  
  // Save previous bowler's stats to bowling array
  if (previousBowlerStats && innings.currentBowler) {
    const prevBowlerIdx = innings.bowling.findIndex(b => 
      b.player?.toString() === innings.currentBowler.player?.toString()
    );
    
    if (prevBowlerIdx >= 0) {
      innings.bowling[prevBowlerIdx] = {
        ...innings.bowling[prevBowlerIdx],
        overs: innings.currentBowler.overs,
        runs: innings.currentBowler.runs,
        wickets: innings.currentBowler.wickets,
        maidens: innings.currentBowler.maidens,
        economy: innings.currentBowler.economy
      };
    }
  }
  
  // Check if new bowler has bowled before
  const existingBowlerIdx = innings.bowling.findIndex(b => 
    b.player?.toString() === bowler._id
  );
  
  let newBowlerStats = {
    player: bowler._id,
    name: bowler.name,
    overs: 0,
    maidens: 0,
    runs: 0,
    wickets: 0,
    economy: 0
  };
  
  if (existingBowlerIdx >= 0) {
    // Use existing stats
    newBowlerStats = innings.bowling[existingBowlerIdx];
  } else {
    // Add new bowler to bowling array
    innings.bowling.push(newBowlerStats);
  }
  
  // Set as current bowler
  innings.currentBowler = newBowlerStats;
  
  // Swap strike (end of over)
  innings.currentBatsmen.forEach(b => { b.onStrike = !b.onStrike; });
  
  await match.save();
  
  return ok(res, match, "bowler_changed");
});

// New batsman after wicket
export const newBatsman = asyncHandler(async (req, res) => {
  const { batsman, dismissedBatsmanId } = req.body;
  const matchId = req.params.matchId;
  
  const match = await Match.findById(matchId);
  if (!match) {
    return ok(res, null, "match_not_found");
  }
  
  const inningsIndex = match.currentInnings - 1;
  const innings = match.innings[inningsIndex];
  
  if (!innings) {
    return ok(res, null, "no_active_innings");
  }
  
  // Move dismissed batsman to batting array with final stats
  const dismissedIdx = innings.currentBatsmen.findIndex(b => b.isOut);
  if (dismissedIdx >= 0) {
    const dismissed = innings.currentBatsmen[dismissedIdx];
    
    // Add or update in batting array
    const battingIdx = innings.batting.findIndex(b => 
      b.player?.toString() === dismissed.player?.toString()
    );
    
    if (battingIdx >= 0) {
      innings.batting[battingIdx] = { ...dismissed };
    } else {
      innings.batting.push({ ...dismissed });
    }
    
    // Replace with new batsman
    innings.currentBatsmen[dismissedIdx] = {
      player: batsman._id,
      name: batsman.name,
      runs: 0,
      balls: 0,
      fours: 0,
      sixes: 0,
      isOut: false,
      onStrike: dismissed.onStrike
    };
  }
  
  // Add new batsman to batting array
  const newBatIdx = innings.batting.findIndex(b => 
    b.player?.toString() === batsman._id
  );
  if (newBatIdx < 0) {
    innings.batting.push({
      player: batsman._id,
      name: batsman.name,
      runs: 0,
      balls: 0,
      fours: 0,
      sixes: 0,
      isOut: false,
      onStrike: false
    });
  }
  
  await match.save();
  
  return ok(res, match, "batsman_added");
});

// End innings - save final innings data and update player stats
export const endInnings = asyncHandler(async (req, res) => {
  const { matchId } = req.params;
  const { inningsData, inningsNumber } = req.body;
  
  const match = await Match.findById(matchId);
  if (!match) {
    return ok(res, null, "match_not_found");
  }
  
  const inningsIndex = inningsNumber - 1;
  const innings = match.innings[inningsIndex];
  
  if (!innings) {
    return ok(res, null, "innings_not_found");
  }
  
  // Update innings with final data from frontend
  if (inningsData) {
    innings.runs = inningsData.totalRuns || innings.runs;
    innings.wickets = inningsData.totalWickets || innings.wickets;
    innings.overs = inningsData.overs || innings.overs;
    innings.runRate = inningsData.runRate || innings.runRate;
    
    // Update batting card
    if (inningsData.battingCard && inningsData.battingCard.length > 0) {
      innings.batting = inningsData.battingCard.map(b => ({
        player: b.player?._id || b.player,
        name: b.player?.name || b.name,
        runs: b.runs || 0,
        balls: b.balls || 0,
        fours: b.fours || 0,
        sixes: b.sixes || 0,
        isOut: b.isOut || false,
        dismissal: b.dismissal?.text || b.dismissal || null
      }));
    }
    
    // Update bowling card
    if (inningsData.bowlingCard && inningsData.bowlingCard.length > 0) {
      innings.bowling = inningsData.bowlingCard.map(b => ({
        player: b.player?._id || b.player,
        name: b.player?.name || b.name,
        overs: Math.floor((b.balls || 0) / 6) + ((b.balls || 0) % 6) / 10,
        maidens: b.maidens || 0,
        runs: b.runs || 0,
        wickets: b.wickets || 0,
        economy: b.balls > 0 ? Number((b.runs / (b.balls / 6)).toFixed(2)) : 0
      }));
    }
    
    // Save fall of wickets
    if (inningsData.fallOfWickets) {
      innings.fallOfWickets = inningsData.fallOfWickets;
    }
    
    // Save extras
    if (inningsData.extras) {
      innings.extras = inningsData.extras;
    }
  }
  
  await match.save();
  
  // Update player stats after innings
  try {
    const statsResult = await updatePlayerStatsAfterInnings(matchId, inningsNumber);
    console.log(`[Match] Player stats updated after innings ${inningsNumber}:`, statsResult);
  } catch (statsError) {
    console.error("[Match] Error updating player stats after innings:", statsError);
    // Don't fail the request if stats update fails
  }
  
  // Broadcast innings end
  const { io } = getRuntime();
  if (io) {
    io.of("/public").emit("innings:ended", { 
      matchId, 
      inningsNumber,
      score: {
        runs: innings.runs,
        wickets: innings.wickets,
        overs: innings.overs
      }
    });
  }
  
  return ok(res, { 
    match, 
    message: `Innings ${inningsNumber} ended. Player stats updated.` 
  }, "innings_ended");
});

// Complete a match - update stats, clean up cache
export const completeMatch = asyncHandler(async (req, res) => {
  const { matchId } = req.params;
  const { winner, result, resultType } = req.body;
  
  const match = await Match.findById(matchId)
    .populate("team1", "name shortName")
    .populate("team2", "name shortName");
  
  if (!match) {
    return ok(res, null, "match_not_found");
  }
  
  // Update match status
  match.status = MATCH_STATUS.COMPLETED;
  
  // Set winner if provided
  if (winner) {
    match.winner = winner;
  }
  
  // Set result description
  if (result) {
    match.result = result;
  } else {
    // Auto-generate result if not provided
    const innings1 = match.innings[0];
    const innings2 = match.innings[1];
    
    if (innings1 && innings2 && match.winner) {
      const winnerTeam = match.winner.toString() === match.team1._id.toString() 
        ? match.team1 
        : match.team2;
      const loserTeam = match.winner.toString() === match.team1._id.toString() 
        ? match.team2 
        : match.team1;
      
      const winnerScore = match.winner.toString() === match.team1._id.toString()
        ? innings1.runs
        : innings2.runs;
      const loserScore = match.winner.toString() === match.team1._id.toString()
        ? innings2.runs
        : innings1.runs;
      
      if (resultType === "runs") {
        const runDiff = winnerScore - loserScore;
        match.result = `${winnerTeam.name} won by ${runDiff} runs`;
      } else if (resultType === "wickets") {
        const wicketsLeft = 10 - (innings2.wickets || 0);
        match.result = `${winnerTeam.name} won by ${wicketsLeft} wickets`;
      } else {
        match.result = `${winnerTeam.name} won`;
      }
    } else if (!match.winner) {
      match.result = "Match Tied";
    }
  }
  
  match.endTime = new Date();
  await match.save();
  
  // Update all stats (team standings, player stats, NRR, etc.)
  try {
    await updateAllStatsOnMatchComplete(matchId);
    console.log(`Stats updated for match ${matchId}`);
  } catch (statsError) {
    console.error("Error updating stats:", statsError);
    // Don't fail the request if stats update fails
  }
  
  // Clean up Redis cache
  try {
    await deleteLiveData(matchId);
    console.log(`Cache cleared for match ${matchId}`);
  } catch (cacheError) {
    console.error("Error clearing cache:", cacheError);
  }
  
  // Broadcast match completion via socket
  const runtime = getRuntime();
  if (runtime.publicIO) {
    runtime.publicIO.to(`match:${matchId}`).emit("match:completed", {
      matchId,
      status: "completed",
      winner: match.winner,
      result: match.result,
      team1: match.team1,
      team2: match.team2,
      innings: match.innings
    });
  }
  
  return ok(res, match, "match_completed");
});
