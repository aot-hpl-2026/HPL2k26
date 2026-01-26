import mongoose from "mongoose";
import Match from "../models/Match.js";
import Ball from "../models/Ball.js";
import { ApiError } from "../utils/apiError.js";
import { MATCH_STATUS } from "../config/constants.js";

const buildScore = (current, ballInput, isLegalDelivery = true) => {
  const runs = (ballInput?.runsOffBat ?? 0) + (ballInput?.extras ?? 0);
  const wickets = ballInput?.wicket ? 1 : 0;
  
  // Only increment overs for legal deliveries
  let newOvers = current?.overs ?? 0;
  if (isLegalDelivery) {
    const currentBalls = Math.floor(current?.overs ?? 0) * 6 + Math.round(((current?.overs ?? 0) % 1) * 10);
    const newBalls = currentBalls + 1;
    newOvers = Math.floor(newBalls / 6) + (newBalls % 6) / 10;
  }
  
  const totalRuns = (current?.runs ?? 0) + runs;
  const runRate = newOvers > 0 ? Number((totalRuns / newOvers).toFixed(2)) : 0;

  return {
    runs: totalRuns,
    wickets: (current?.wickets ?? 0) + wickets,
    overs: Number(newOvers.toFixed(1)),
    runRate: Number(runRate)
  };
};

const getBallDisplay = (payload) => {
  if (payload?.wicket) return 'W';
  if ((payload?.extras ?? 0) > 0 && payload?.extraType === 'wide') return 'Wd';
  if ((payload?.extras ?? 0) > 0 && payload?.extraType === 'noball') return 'Nb';
  return (payload?.runsOffBat ?? 0).toString();
};

export const recordBall = async (matchId, payload) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // Validate over number
    if (payload.over < 0) {
      throw new ApiError("Invalid over number", 400);
    }
    
    // Ball number validation: 1-6 for legal deliveries
    // For extras (wides/noballs), ball number can be 0 (same ball repeated)
    const isExtra = payload.extraType === 'wide' || payload.extraType === 'noball';
    const ballNumber = payload.ball || 1; // Default to 1 if not provided or 0
    if (!isExtra && (ballNumber < 1 || ballNumber > 6)) {
      throw new ApiError("Invalid ball number", 400);
    }
    
    if ((payload.runsOffBat || 0) < 0 || (payload.extras || 0) < 0) {
      throw new ApiError("Invalid runs", 400);
    }

    const match = await Match.findById(matchId).session(session);
    if (!match) throw new ApiError("Match not found", 404);
    if (match.status !== MATCH_STATUS.LIVE) throw new ApiError("Match not live", 400);

    const currentInnings = match.currentInnings || 1;

    // Get the next delivery number for this match/innings (auto-increment)
    const lastBall = await Ball.findOne({ 
      match: matchId, 
      innings: currentInnings 
    }).sort({ deliveryNumber: -1 }).session(session);
    
    const deliveryNumber = (lastBall?.deliveryNumber || 0) + 1;

    const ball = await Ball.create([
      {
        match: matchId,
        innings: currentInnings,
        over: payload.over || 0,
        ball: ballNumber,  // Use validated ballNumber
        deliveryNumber: deliveryNumber,
        battingTeam: payload.battingTeam,
        bowlingTeam: payload.bowlingTeam,
        // Player IDs for reference (optional)
        strikerId: payload.strikerId || null,
        nonStrikerId: payload.nonStrikerId || null,
        bowlerId: payload.bowlerId || null,
        // Player names for display
        striker: payload.striker,
        nonStriker: payload.nonStriker,
        bowler: payload.bowler,
        runsOffBat: payload.runsOffBat || 0,
        extras: payload.extras || 0,
        extraType: payload.extraType,
        wicket: payload.wicket || false,
        dismissal: payload.dismissal
      }
    ], { session });

    // Determine if this is a legal delivery
    const isLegalDelivery = !payload.extraType || (payload.extraType !== 'wide' && payload.extraType !== 'noball');

    // Update main score
    match.score = buildScore(match.score, payload, isLegalDelivery);

    // Update current innings
    const inningsIndex = match.currentInnings - 1;
    if (match.innings[inningsIndex]) {
      const innings = match.innings[inningsIndex];
      innings.runs = match.score.runs;
      innings.wickets = match.score.wickets;
      innings.overs = match.score.overs;
      innings.runRate = match.score.runRate;

      // Add ball to recent balls
      const ballDisplay = getBallDisplay(payload);
      innings.recentBalls = [...(innings.recentBalls || []).slice(-11), ballDisplay];

      // Determine if this is a legal delivery (not wide or no ball)
      const isLegalDelivery = !payload.extraType || (payload.extraType !== 'wide' && payload.extraType !== 'noball');
      
      // Update current batsman stats
      if (innings.currentBatsmen && innings.currentBatsmen.length > 0) {
        const strikerIdx = innings.currentBatsmen.findIndex(b => b.onStrike);
        if (strikerIdx !== -1) {
          // Runs off bat count for batsman (not extras like byes/leg byes)
          // For wide: batsman doesn't face the ball, no runs credited to batsman
          // For no ball: batsman faces but runs go to batsman
          // For bye/leg bye: batsman faces but runs don't count for batsman
          if (payload.extraType !== 'wide' && payload.extraType !== 'bye' && payload.extraType !== 'legbye') {
            innings.currentBatsmen[strikerIdx].runs += payload.runsOffBat;
          }
          
          // Ball faced only for legal deliveries (not wide/no ball)
          // No ball is debatable - some count it, some don't. Following ICC: no ball doesn't count as ball faced
          if (isLegalDelivery) {
            innings.currentBatsmen[strikerIdx].balls += 1;
          }
          
          if (payload.runsOffBat === 4) innings.currentBatsmen[strikerIdx].fours += 1;
          if (payload.runsOffBat === 6) innings.currentBatsmen[strikerIdx].sixes += 1;
          if (payload.wicket) innings.currentBatsmen[strikerIdx].isOut = true;

          // Swap strike on odd runs (total runs including extras for wide/no ball)
          const totalRuns = payload.runsOffBat + (payload.extras || 0);
          if (totalRuns % 2 === 1) {
            innings.currentBatsmen.forEach(b => { b.onStrike = !b.onStrike; });
          }
        }
      }

      // Update current bowler stats
      if (innings.currentBowler) {
        // Byes and leg byes don't count against bowler's runs
        const runsAgainstBowler = (payload.extraType === 'bye' || payload.extraType === 'legbye') 
          ? 0 
          : (payload.runsOffBat + payload.extras);
        innings.currentBowler.runs += runsAgainstBowler;
        if (payload.wicket) innings.currentBowler.wickets += 1;
        // Update overs only for valid deliveries
        if (isLegalDelivery) {
          const bowlerBalls = Math.floor(innings.currentBowler.overs) * 6 + 
                              Math.round((innings.currentBowler.overs % 1) * 10) + 1;
          innings.currentBowler.overs = Math.floor(bowlerBalls / 6) + (bowlerBalls % 6) / 10;
        }
        // Calculate economy
        if (innings.currentBowler.overs > 0) {
          innings.currentBowler.economy = Number((innings.currentBowler.runs / innings.currentBowler.overs).toFixed(2));
        }
      }
    }

    await match.save({ session });

    await session.commitTransaction();
    
    // Return enriched data for live updates
    const currentInningsData = match.innings[match.currentInnings - 1];
    return { 
      match: {
        ...match.toObject(),
        score: match.score,
        currentBatsmen: currentInningsData?.currentBatsmen || [],
        currentBowler: currentInningsData?.currentBowler || null,
        recentBalls: currentInningsData?.recentBalls || []
      }, 
      ball: ball[0] 
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// Initialize innings when match starts
export const initializeInnings = async (matchId, battingTeamId, bowlingTeamId, openers, bowler) => {
  const match = await Match.findById(matchId);
  if (!match) throw new ApiError("Match not found", 404);

  const innings = {
    battingTeam: battingTeamId,
    bowlingTeam: bowlingTeamId,
    runs: 0,
    wickets: 0,
    overs: 0,
    runRate: 0,
    batting: [],
    bowling: [],
    currentBatsmen: openers.map((opener, idx) => ({
      player: opener.id,
      name: opener.name,
      runs: 0,
      balls: 0,
      fours: 0,
      sixes: 0,
      isOut: false,
      onStrike: idx === 0
    })),
    currentBowler: {
      player: bowler.id,
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

  return match;
};
