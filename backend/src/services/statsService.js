import Ball from "../models/Ball.js";
import Player from "../models/Player.js";
import Team from "../models/Team.js";
import Match from "../models/Match.js";
import mongoose from "mongoose";

// Comprehensive player stats derivation from Ball collection
export const derivePlayerStats = async (playerId) => {
  const playerObjectId = typeof playerId === 'string' 
    ? new mongoose.Types.ObjectId(playerId) 
    : playerId;

  // Batting aggregation - comprehensive stats
  const battingPipeline = [
    { $match: { strikerId: playerObjectId } },
    {
      $group: {
        _id: "$matchId",
        runs: { $sum: "$runsOffBat" },
        balls: { $sum: 1 },
        fours: { $sum: { $cond: [{ $eq: ["$runsOffBat", 4] }, 1, 0] } },
        sixes: { $sum: { $cond: [{ $eq: ["$runsOffBat", 6] }, 1, 0] } },
        dismissed: { $max: { $cond: [{ $and: [{ $eq: ["$wicket", true] }, { $ne: ["$dismissalType", "run out (non-striker)"] }] }, 1, 0] } }
      }
    },
    {
      $group: {
        _id: null,
        totalRuns: { $sum: "$runs" },
        totalBalls: { $sum: "$balls" },
        totalFours: { $sum: "$fours" },
        totalSixes: { $sum: "$sixes" },
        highScore: { $max: "$runs" },
        innings: { $sum: 1 },
        dismissals: { $sum: "$dismissed" },
        notOuts: { $sum: { $cond: [{ $eq: ["$dismissed", 0] }, 1, 0] } }
      }
    }
  ];

  // Bowling aggregation - comprehensive stats
  const bowlingPipeline = [
    { $match: { bowlerId: playerObjectId } },
    {
      $group: {
        _id: "$matchId",
        runs: { $sum: { $add: ["$runsOffBat", { $ifNull: ["$extras", 0] }] } },
        balls: { $sum: 1 },
        wickets: { $sum: { $cond: [{ $and: [{ $eq: ["$wicket", true] }, { $in: ["$dismissalType", ["bowled", "caught", "lbw", "stumped", "hit wicket"]] }] }, 1, 0] } },
        dots: { $sum: { $cond: [{ $eq: [{ $add: ["$runsOffBat", { $ifNull: ["$extras", 0] }] }, 0] }, 1, 0] } }
      }
    },
    {
      $group: {
        _id: null,
        totalRuns: { $sum: "$runs" },
        totalBalls: { $sum: "$balls" },
        totalWickets: { $sum: "$wickets" },
        totalDots: { $sum: "$dots" },
        innings: { $sum: 1 },
        // Track best figures per match for later processing
        matchFigures: { $push: { wickets: "$wickets", runs: "$runs" } }
      }
    }
  ];

  // Fielding aggregation
  const fieldingPipeline = [
    { 
      $match: { 
        $or: [
          { catcherId: playerObjectId },
          { $and: [{ dismissalType: "run out" }, { fielderId: playerObjectId }] },
          { $and: [{ dismissalType: "stumped" }, { stumpedById: playerObjectId }] }
        ]
      } 
    },
    {
      $group: {
        _id: null,
        catches: { $sum: { $cond: [{ $eq: ["$catcherId", playerObjectId] }, 1, 0] } },
        runOuts: { $sum: { $cond: [{ $and: [{ $eq: ["$dismissalType", "run out"] }, { $eq: ["$fielderId", playerObjectId] }] }, 1, 0] } },
        stumpings: { $sum: { $cond: [{ $and: [{ $eq: ["$dismissalType", "stumped"] }, { $eq: ["$stumpedById", playerObjectId] }] }, 1, 0] } }
      }
    }
  ];

  const [battingResult, bowlingResult, fieldingResult] = await Promise.all([
    Ball.aggregate(battingPipeline),
    Ball.aggregate(bowlingPipeline),
    Ball.aggregate(fieldingPipeline)
  ]);

  const batting = battingResult[0] || { totalRuns: 0, totalBalls: 0, totalFours: 0, totalSixes: 0, highScore: 0, innings: 0, dismissals: 0, notOuts: 0 };
  const bowling = bowlingResult[0] || { totalRuns: 0, totalBalls: 0, totalWickets: 0, innings: 0, matchFigures: [] };
  const fielding = fieldingResult[0] || { catches: 0, runOuts: 0, stumpings: 0 };

  // Calculate batting average and strike rate
  const battingAverage = batting.dismissals > 0 
    ? Number((batting.totalRuns / batting.dismissals).toFixed(2)) 
    : batting.totalRuns;
  const strikeRate = batting.totalBalls > 0 
    ? Number(((batting.totalRuns / batting.totalBalls) * 100).toFixed(2)) 
    : 0;

  // Calculate bowling economy and average
  const overs = Math.floor(bowling.totalBalls / 6) + (bowling.totalBalls % 6) / 10;
  const economy = bowling.totalBalls > 0 
    ? Number(((bowling.totalRuns / bowling.totalBalls) * 6).toFixed(2)) 
    : 0;
  const bowlingAverage = bowling.totalWickets > 0 
    ? Number((bowling.totalRuns / bowling.totalWickets).toFixed(2)) 
    : 0;

  // Calculate best bowling figures
  let bestFigures = '-';
  if (bowling.matchFigures && bowling.matchFigures.length > 0) {
    const best = bowling.matchFigures.reduce((prev, curr) => {
      if (curr.wickets > prev.wickets) return curr;
      if (curr.wickets === prev.wickets && curr.runs < prev.runs) return curr;
      return prev;
    }, { wickets: 0, runs: 999 });
    if (best.wickets > 0) {
      bestFigures = `${best.wickets}/${best.runs}`;
    }
  }

  return {
    matches: Math.max(batting.innings, bowling.innings),
    batting: {
      matches: batting.innings,
      innings: batting.innings,
      runs: batting.totalRuns,
      balls: batting.totalBalls,
      fours: batting.totalFours,
      sixes: batting.totalSixes,
      highScore: batting.highScore,
      notOuts: batting.notOuts,
      average: battingAverage,
      strikeRate: strikeRate
    },
    bowling: {
      matches: bowling.innings,
      innings: bowling.innings,
      overs: overs,
      balls: bowling.totalBalls,
      runs: bowling.totalRuns,
      wickets: bowling.totalWickets,
      bestFigures: bestFigures,
      economy: economy,
      average: bowlingAverage
    },
    fielding: {
      catches: fielding.catches,
      runOuts: fielding.runOuts,
      stumpings: fielding.stumpings
    }
  };
};

export const getTopBatsmen = async (limit = 5) => {
  // Get top batsmen by aggregating ball data using strikerId (ObjectId)
  const topBatsmen = await Ball.aggregate([
    { $match: { strikerId: { $ne: null } } },
    {
      $group: {
        _id: "$strikerId",
        runs: { $sum: "$runsOffBat" },
        balls: { $sum: 1 },
        fours: { $sum: { $cond: [{ $eq: ["$runsOffBat", 4] }, 1, 0] } },
        sixes: { $sum: { $cond: [{ $eq: ["$runsOffBat", 6] }, 1, 0] } }
      }
    },
    { $sort: { runs: -1 } },
    { $limit: limit }
  ]);

  // Populate player details
  const playerIds = topBatsmen.map(b => b._id).filter(id => id);
  const players = await Player.find({ _id: { $in: playerIds } })
    .populate('team', 'name shortName logoUrl')
    .lean();

  const playerMap = {};
  players.forEach(p => { playerMap[p._id.toString()] = p; });

  return topBatsmen.map((b, index) => {
    const player = playerMap[b._id?.toString()] || {};
    const strikeRate = b.balls ? ((b.runs / b.balls) * 100).toFixed(2) : 0;
    return {
      rank: index + 1,
      id: b._id,
      name: player.name || 'Unknown',
      team: player.team?.shortName || 'N/A',
      teamLogo: player.team?.logoUrl,
      runs: b.runs,
      balls: b.balls,
      fours: b.fours,
      sixes: b.sixes,
      strikeRate: Number(strikeRate)
    };
  });
};

export const getTopBowlers = async (limit = 5) => {
  // Get top bowlers by aggregating ball data using bowlerId (ObjectId)
  const topBowlers = await Ball.aggregate([
    { $match: { bowlerId: { $ne: null } } },
    {
      $group: {
        _id: "$bowlerId",
        wickets: { $sum: { $cond: ["$wicket", 1, 0] } },
        runs: { $sum: { $add: ["$runsOffBat", { $ifNull: ["$extras", 0] }] } },
        balls: { $sum: 1 }
      }
    },
    { $sort: { wickets: -1, runs: 1 } },
    { $limit: limit }
  ]);

  // Populate player details
  const playerIds = topBowlers.map(b => b._id).filter(id => id);
  const players = await Player.find({ _id: { $in: playerIds } })
    .populate('team', 'name shortName logoUrl')
    .lean();

  const playerMap = {};
  players.forEach(p => { playerMap[p._id.toString()] = p; });

  return topBowlers.map((b, index) => {
    const player = playerMap[b._id?.toString()] || {};
    const overs = Math.floor(b.balls / 6) + (b.balls % 6) / 10;
    const economy = b.balls ? ((b.runs / b.balls) * 6).toFixed(2) : 0;
    return {
      rank: index + 1,
      id: b._id,
      name: player.name || 'Unknown',
      team: player.team?.shortName || 'N/A',
      teamLogo: player.team?.logoUrl,
      wickets: b.wickets,
      runs: b.runs,
      overs: overs.toFixed(1),
      economy: Number(economy)
    };
  });
};

// Update team stats when a match is completed
export const updateTeamStatsOnMatchComplete = async (matchId) => {
  const match = await Match.findById(matchId)
    .populate('teamA')
    .populate('teamB')
    .populate('winner');
  
  if (!match || match.status !== 'completed') {
    console.log('[Stats] Match not found or not completed:', matchId);
    return;
  }

  const teamAId = match.teamA._id.toString();
  const teamBId = match.teamB._id.toString();
  const winnerId = match.winner?._id?.toString();

  // Get innings data
  const innings1 = match.innings[0];
  const innings2 = match.innings[1];

  if (!innings1) {
    console.log('[Stats] No innings data found for match:', matchId);
    return;
  }

  // Calculate runs and overs for each team
  let teamABattingRuns = 0, teamABattingOvers = 0;
  let teamBBattingRuns = 0, teamBBattingOvers = 0;
  
  // First innings
  if (innings1.battingTeam?.toString() === teamAId) {
    teamABattingRuns = innings1.runs || 0;
    teamABattingOvers = innings1.overs || 0;
  } else {
    teamBBattingRuns = innings1.runs || 0;
    teamBBattingOvers = innings1.overs || 0;
  }

  // Second innings
  if (innings2) {
    if (innings2.battingTeam?.toString() === teamAId) {
      teamABattingRuns = innings2.runs || 0;
      teamABattingOvers = innings2.overs || 0;
    } else {
      teamBBattingRuns = innings2.runs || 0;
      teamBBattingOvers = innings2.overs || 0;
    }
  }

  // Update Team A stats
  const teamAUpdate = {
    $inc: {
      'stats.matchesPlayed': 1,
      'stats.runsScored': teamABattingRuns,
      'stats.runsConceded': teamBBattingRuns,
      'stats.oversPlayed': teamABattingOvers,
      'stats.oversBowled': teamBBattingOvers
    }
  };

  if (winnerId === teamAId) {
    teamAUpdate.$inc['stats.wins'] = 1;
    teamAUpdate.$inc['stats.points'] = 2;
  } else if (winnerId === teamBId) {
    teamAUpdate.$inc['stats.losses'] = 1;
  } else {
    // Tie or no result
    teamAUpdate.$inc['stats.ties'] = 1;
    teamAUpdate.$inc['stats.points'] = 1;
  }

  // Update Team B stats
  const teamBUpdate = {
    $inc: {
      'stats.matchesPlayed': 1,
      'stats.runsScored': teamBBattingRuns,
      'stats.runsConceded': teamABattingRuns,
      'stats.oversPlayed': teamBBattingOvers,
      'stats.oversBowled': teamABattingOvers
    }
  };

  if (winnerId === teamBId) {
    teamBUpdate.$inc['stats.wins'] = 1;
    teamBUpdate.$inc['stats.points'] = 2;
  } else if (winnerId === teamAId) {
    teamBUpdate.$inc['stats.losses'] = 1;
  } else {
    teamBUpdate.$inc['stats.ties'] = 1;
    teamBUpdate.$inc['stats.points'] = 1;
  }

  try {
    await Team.findByIdAndUpdate(teamAId, teamAUpdate);
    await Team.findByIdAndUpdate(teamBId, teamBUpdate);

    // Recalculate NRR for both teams
    await recalculateTeamNRR(teamAId);
    await recalculateTeamNRR(teamBId);

    console.log('[Stats] Updated team stats for match:', matchId);
  } catch (error) {
    console.error('[Stats] Failed to update team stats:', error);
  }
};

// Recalculate Net Run Rate for a team
export const recalculateTeamNRR = async (teamId) => {
  const team = await Team.findById(teamId);
  if (!team) return;

  const { runsScored, runsConceded, oversPlayed, oversBowled } = team.stats;

  if (oversPlayed > 0 && oversBowled > 0) {
    const forRate = runsScored / oversPlayed;
    const againstRate = runsConceded / oversBowled;
    const nrr = Number((forRate - againstRate).toFixed(3));
    
    await Team.findByIdAndUpdate(teamId, { 'stats.nrr': nrr });
  }
};

// Update player career stats after match
export const updatePlayerStatsFromMatch = async (matchId) => {
  const match = await Match.findById(matchId);
  if (!match) return;

  const playersToUpdate = new Set();

  // Collect all player IDs from innings
  for (const innings of match.innings) {
    if (innings.batting) {
      innings.batting.forEach(b => {
        if (b.player) playersToUpdate.add(b.player.toString());
      });
    }
    if (innings.bowling) {
      innings.bowling.forEach(b => {
        if (b.player) playersToUpdate.add(b.player.toString());
      });
    }
    // Also check currentBatsmen and currentBowler
    if (innings.currentBatsmen) {
      innings.currentBatsmen.forEach(b => {
        if (b.player) playersToUpdate.add(b.player.toString());
      });
    }
    if (innings.currentBowler?.player) {
      playersToUpdate.add(innings.currentBowler.player.toString());
    }
  }

  // Update each player's career stats with comprehensive data
  for (const playerId of playersToUpdate) {
    try {
      const stats = await derivePlayerStats(playerId);
      
      await Player.findByIdAndUpdate(playerId, {
        'stats.matches': stats.matches,
        // Batting stats
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
        // Bowling stats
        'stats.bowling.matches': stats.bowling.matches,
        'stats.bowling.innings': stats.bowling.innings,
        'stats.bowling.overs': stats.bowling.overs,
        'stats.bowling.balls': stats.bowling.balls,
        'stats.bowling.runs': stats.bowling.runs,
        'stats.bowling.wickets': stats.bowling.wickets,
        'stats.bowling.bestFigures': stats.bowling.bestFigures,
        'stats.bowling.economy': stats.bowling.economy,
        'stats.bowling.average': stats.bowling.average,
        // Fielding stats
        'stats.fielding.catches': stats.fielding.catches,
        'stats.fielding.runOuts': stats.fielding.runOuts,
        'stats.fielding.stumpings': stats.fielding.stumpings
      });
      
      console.log(`[Stats] Updated comprehensive stats for player ${playerId}`);
    } catch (error) {
      console.error(`[Stats] Failed to update player ${playerId}:`, error);
    }
  }

  console.log(`[Stats] Updated ${playersToUpdate.size} player stats for match:`, matchId);
};

// Main function to update all stats when match completes
export const updateAllStatsOnMatchComplete = async (matchId) => {
  console.log('[Stats] Updating all stats for completed match:', matchId);
  
  try {
    await updateTeamStatsOnMatchComplete(matchId);
    await updatePlayerStatsFromMatch(matchId);
    console.log('[Stats] All stats updated successfully');
  } catch (error) {
    console.error('[Stats] Failed to update stats:', error);
    throw error;
  }
};

// Update player stats after an innings ends
export const updatePlayerStatsAfterInnings = async (matchId, inningsNumber) => {
  console.log(`[Stats] Updating player stats after innings ${inningsNumber} for match:`, matchId);
  
  const match = await Match.findById(matchId);
  if (!match) {
    console.log('[Stats] Match not found:', matchId);
    return;
  }

  const innings = match.innings[inningsNumber - 1];
  if (!innings) {
    console.log('[Stats] Innings data not found');
    return;
  }

  const playersToUpdate = new Set();

  // Collect all player IDs from this innings
  if (innings.batting) {
    innings.batting.forEach(b => {
      if (b.player) playersToUpdate.add(b.player.toString());
    });
  }
  if (innings.bowling) {
    innings.bowling.forEach(b => {
      if (b.player) playersToUpdate.add(b.player.toString());
    });
  }

  // Also check currentBatsmen and currentBowler
  if (innings.currentBatsmen) {
    innings.currentBatsmen.forEach(b => {
      if (b.player) playersToUpdate.add(b.player.toString());
    });
  }
  if (innings.currentBowler?.player) {
    playersToUpdate.add(innings.currentBowler.player.toString());
  }

  // Update each player's career stats with comprehensive data from Ball collection
  for (const playerId of playersToUpdate) {
    try {
      const stats = await derivePlayerStats(playerId);
      
      await Player.findByIdAndUpdate(playerId, {
        'stats.matches': stats.matches,
        // Batting stats
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
        // Bowling stats
        'stats.bowling.matches': stats.bowling.matches,
        'stats.bowling.innings': stats.bowling.innings,
        'stats.bowling.overs': stats.bowling.overs,
        'stats.bowling.balls': stats.bowling.balls,
        'stats.bowling.runs': stats.bowling.runs,
        'stats.bowling.wickets': stats.bowling.wickets,
        'stats.bowling.bestFigures': stats.bowling.bestFigures,
        'stats.bowling.economy': stats.bowling.economy,
        'stats.bowling.average': stats.bowling.average,
        // Fielding stats
        'stats.fielding.catches': stats.fielding.catches,
        'stats.fielding.runOuts': stats.fielding.runOuts,
        'stats.fielding.stumpings': stats.fielding.stumpings
      });
      
      console.log(`[Stats] Updated player ${playerId} stats after innings ${inningsNumber}`);
    } catch (error) {
      console.error(`[Stats] Failed to update player ${playerId}:`, error);
    }
  }

  console.log(`[Stats] Updated ${playersToUpdate.size} player stats after innings ${inningsNumber}`);
  return { updatedPlayers: playersToUpdate.size };
};
