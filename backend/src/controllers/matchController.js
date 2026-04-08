import { createMatch, updateMatch, getMatches, getMatchById, deleteMatch, getLiveMatches, getUpcomingMatches, getCompletedMatches, getMatchesByTeam } from "../services/matchService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { created, ok } from "../config/response.js";
import Match from "../models/Match.js";
import { MATCH_STATUS } from "../config/constants.js";
import { updateAllStatsOnMatchComplete } from "../services/statsService.js";
import { ApiError } from "../utils/apiError.js";

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

export const remove = asyncHandler(async (req, res) => {
  await deleteMatch(req.params.matchId);
  return ok(res, null, "match_deleted");
});

// Helper to build dismissal text
const buildDismissalText = (dismissalType, bowlerName, fielderName) => {
  if (!dismissalType) return null;
  if (dismissalType === 'caught') {
    if (fielderName && fielderName !== bowlerName) {
      return `c ${fielderName} b ${bowlerName}`;
    }
    return `c & b ${bowlerName || ''}`;
  }
  if (dismissalType === 'bowled') return `b ${bowlerName || ''}`;
  if (dismissalType === 'lbw') return `lbw b ${bowlerName || ''}`;
  if (dismissalType === 'run_out') {
    return fielderName ? `run out (${fielderName})` : 'run out';
  }
  return dismissalType;
};

// Shared: process and save innings stats onto a match document
const applyMatchStats = async (match, body) => {
  const { toss, innings: inningsData, winner, result, resultType } = body;

  if (toss) match.toss = toss;

  const processedInnings = (inningsData || []).map(inning => {
    const batting = (inning.batting || []).map(b => {
      const runs = (b.ones || 0) + 2 * (b.twos || 0) + 3 * (b.threes || 0) +
        4 * (b.fours || 0) + 5 * (b.fives || 0) + 6 * (b.sixes || 0);
      const dismissalText = b.dismissalType
        ? buildDismissalText(b.dismissalType, b.bowlerName, b.fielderName)
        : null;
      return {
        player: b.player || null, name: b.name || '',
        ones: b.ones || 0, twos: b.twos || 0, threes: b.threes || 0,
        fours: b.fours || 0, fives: b.fives || 0, sixes: b.sixes || 0,
        balls: b.balls || 0, runs,
        isOut: !!b.dismissalType, dismissalType: b.dismissalType || null,
        bowler: b.bowler || null, fielder: b.fielder || null, dismissal: dismissalText
      };
    });

    const bowling = (inning.bowling || []).map(b => {
      const runsPerOver = b.runsPerOver || [];
      const runs = runsPerOver.reduce((s, r) => s + r, 0) + (b.wides || 0) + (b.noBalls || 0);
      const overs = b.overs != null ? b.overs : runsPerOver.length;
      const economy = overs > 0 ? Number((runs / overs).toFixed(2)) : 0;
      return {
        player: b.player || null, name: b.name || '',
        overs, wickets: b.wickets || 0, wides: b.wides || 0, noBalls: b.noBalls || 0,
        runsPerOver, runs, economy
      };
    });

    const battingRuns = batting.reduce((s, b) => s + b.runs, 0);
    const extrasRuns = inning.extras || 0;
    const penaltyRuns = inning.penaltyRuns || 0;
    const totalRuns = battingRuns + extrasRuns + penaltyRuns;
    const totalWickets = batting.filter(b => b.isOut).length;
    const totalOvers = bowling.reduce((s, b) => s + (b.overs || 0), 0);

    const bowlingTeam = inning.bowlingTeam ||
      (inning.battingTeam?.toString() === match.teamA._id.toString()
        ? match.teamB._id : match.teamA._id);

    return {
      battingTeam: inning.battingTeam, bowlingTeam,
      batting, bowling,
      runs: totalRuns, wickets: totalWickets, overs: totalOvers,
      extras: extrasRuns, penaltyRuns
    };
  });

  match.innings = processedInnings;
  match.currentInnings = processedInnings.length;
  match.status = MATCH_STATUS.COMPLETED;

  if (winner) match.winner = winner;
  else match.winner = undefined;

  if (result) {
    match.result = result;
  } else if (match.winner && processedInnings.length >= 2) {
    const winnerTeam = match.winner.toString() === match.teamA._id.toString()
      ? match.teamA : match.teamB;
    const winnerInnings = processedInnings.find(
      i => i.battingTeam?.toString() === match.winner.toString()
    );
    const loserInnings = processedInnings.find(
      i => i.battingTeam?.toString() !== match.winner.toString()
    );
    if (resultType === 'runs' && winnerInnings && loserInnings) {
      const diff = winnerInnings.runs - loserInnings.runs;
      match.result = `${winnerTeam.name} won by ${diff} run${diff !== 1 ? 's' : ''}`;
    } else if (resultType === 'wickets' && winnerInnings) {
      const wicketsLeft = 10 - (winnerInnings.wickets || 0);
      match.result = `${winnerTeam.name} won by ${wicketsLeft} wicket${wicketsLeft !== 1 ? 's' : ''}`;
    } else {
      match.result = `${winnerTeam.name} won`;
    }
  } else if (!winner) {
    match.result = 'Match Tied';
  }

  await match.save();
  return match;
};

// POST /api/matches/:matchId/stats — first-time submission
export const submitMatchStats = asyncHandler(async (req, res) => {
  const { matchId } = req.params;
  const match = await Match.findById(matchId)
    .populate('teamA', 'name shortName')
    .populate('teamB', 'name shortName');
  if (!match) throw new ApiError('Match not found', 404);
  if (match.status === MATCH_STATUS.COMPLETED)
    throw new ApiError('Match stats have already been submitted. Use PUT to edit.', 400);

  const saved = await applyMatchStats(match, req.body);
  try { await updateAllStatsOnMatchComplete(matchId); } catch (e) {
    console.error('[Match] Error updating stats:', e);
  }
  return ok(res, saved, 'match_stats_submitted');
});

// PUT /api/matches/:matchId/stats — edit already-submitted stats
export const updateMatchStats = asyncHandler(async (req, res) => {
  const { matchId } = req.params;
  const match = await Match.findById(matchId)
    .populate('teamA', 'name shortName')
    .populate('teamB', 'name shortName');
  if (!match) throw new ApiError('Match not found', 404);

  const saved = await applyMatchStats(match, req.body);
  try { await updateAllStatsOnMatchComplete(matchId); } catch (e) {
    console.error('[Match] Error updating stats:', e);
  }
  return ok(res, saved, 'match_stats_updated');
});
