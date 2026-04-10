import { derivePlayerStats, getTopBatsmen, getTopBowlers, updateTeamStatsOnMatchComplete } from "../services/statsService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ok } from "../config/response.js";
import Player from "../models/Player.js";
import Match from "../models/Match.js";
import { MATCH_STATUS } from "../config/constants.js";

export const playerStats = asyncHandler(async (req, res) => {
  const data = await derivePlayerStats(req.params.playerId);
  return ok(res, data, "player_stats");
});

export const topBatsmen = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 5;
  const data = await getTopBatsmen(limit);
  return ok(res, data, "top_batsmen");
});

export const topBowlers = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 5;
  const data = await getTopBowlers(limit);
  return ok(res, data, "top_bowlers");
});

// Recalculate all player stats from match innings data
export const recalculateAllPlayerStats = asyncHandler(async (req, res) => {
  const players = await Player.find({}).select('_id name');
  let updated = 0;
  let failed = 0;

  for (const player of players) {
    try {
      const stats = await derivePlayerStats(player._id);
      
      await Player.findByIdAndUpdate(player._id, {
        'stats.matches': stats.matches,
        'stats.batting.matches': stats.batting.matches,
        'stats.batting.innings': stats.batting.innings,
        'stats.batting.runs': stats.batting.runs,
        'stats.batting.balls': stats.batting.balls,
        'stats.batting.fours': stats.batting.fours,
        'stats.batting.sixes': stats.batting.sixes,
        'stats.batting.highScore': stats.batting.highScore,
        'stats.batting.notOuts': stats.batting.notOuts,
        'stats.batting.average': stats.batting.average,
        'stats.batting.strikeRate': stats.batting.strikeRate,
        'stats.bowling.matches': stats.bowling.matches,
        'stats.bowling.innings': stats.bowling.innings,
        'stats.bowling.overs': stats.bowling.overs,
        'stats.bowling.balls': stats.bowling.balls,
        'stats.bowling.runs': stats.bowling.runs,
        'stats.bowling.wickets': stats.bowling.wickets,
        'stats.bowling.bestFigures': stats.bowling.bestFigures,
        'stats.bowling.economy': stats.bowling.economy,
        'stats.bowling.average': stats.bowling.average,
        'stats.fielding.catches': stats.fielding.catches,
        'stats.fielding.runOuts': stats.fielding.runOuts
      });
      
      updated++;
    } catch (error) {
      console.error(`Failed to update player ${player.name}:`, error);
      failed++;
    }
  }

  return ok(res, {
    totalPlayers: players.length,
    updated,
    failed
  }, "stats_recalculated");
});

// Recalculate all team stats from completed match data
export const recalculateAllTeamStats = asyncHandler(async (req, res) => {
  const completedMatches = await Match.find({ status: MATCH_STATUS.COMPLETED }).select('_id').lean();
  const processedTeams = new Set();

  for (const match of completedMatches) {
    await updateTeamStatsOnMatchComplete(match._id);
  }

  return ok(res, { matchesProcessed: completedMatches.length }, "team_stats_recalculated");
});
