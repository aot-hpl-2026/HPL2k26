import Player from "../models/Player.js";
import Team from "../models/Team.js";
import Match from "../models/Match.js";
import { MATCH_STATUS } from "../config/constants.js";

// Compute runs from breakdown fields
const computeRuns = (b) => {
  if (b.runs != null) return b.runs;
  return (b.ones || 0) + 2 * (b.twos || 0) + 3 * (b.threes || 0) +
    4 * (b.fours || 0) + 5 * (b.fives || 0) + 6 * (b.sixes || 0);
};

// Derive full career stats for a player from Match innings data
export const derivePlayerStats = async (playerId) => {
  const playerIdStr = typeof playerId === 'string' ? playerId : playerId.toString();

  const matches = await Match.find({ status: MATCH_STATUS.COMPLETED }).lean();

  let battingInnings = 0, battingRuns = 0, battingBalls = 0;
  let battingFours = 0, battingSixes = 0, battingHighScore = 0;
  let battingDismissals = 0, battingNotOuts = 0;

  let bowlingInnings = 0, bowlingOvers = 0, bowlingRuns = 0, bowlingWickets = 0;
  const bowlingMatchFigures = [];

  let fieldingCatches = 0, fieldingRunOuts = 0;

  const matchesPlayedSet = new Set();

  for (const match of matches) {
    for (const innings of (match.innings || [])) {
      // Batting
      const batsmanEntry = (innings.batting || []).find(
        b => b.player?.toString() === playerIdStr
      );
      if (batsmanEntry) {
        matchesPlayedSet.add(match._id.toString());
        battingInnings++;
        const runs = computeRuns(batsmanEntry);
        battingRuns += runs;
        battingBalls += batsmanEntry.balls || 0;
        battingFours += batsmanEntry.fours || 0;
        battingSixes += batsmanEntry.sixes || 0;
        if (runs > battingHighScore) battingHighScore = runs;
        if (batsmanEntry.isOut || batsmanEntry.dismissalType) {
          battingDismissals++;
        } else {
          battingNotOuts++;
        }
      }

      // Bowling
      const bowlerEntry = (innings.bowling || []).find(
        b => b.player?.toString() === playerIdStr
      );
      if (bowlerEntry) {
        matchesPlayedSet.add(match._id.toString());
        bowlingInnings++;
        bowlingOvers += bowlerEntry.overs || 0;
        bowlingWickets += bowlerEntry.wickets || 0;
        const runs = bowlerEntry.runs != null
          ? bowlerEntry.runs
          : (bowlerEntry.runsPerOver || []).reduce((s, r) => s + r, 0);
        bowlingRuns += runs;
        bowlingMatchFigures.push({ wickets: bowlerEntry.wickets || 0, runs });
      }

      // Fielding (from batting dismissals)
      for (const b of (innings.batting || [])) {
        if (b.fielder?.toString() === playerIdStr) {
          if (b.dismissalType === 'caught') fieldingCatches++;
          if (b.dismissalType === 'run_out') fieldingRunOuts++;
        }
      }
    }
  }

  const battingAverage = battingDismissals > 0
    ? Number((battingRuns / battingDismissals).toFixed(2))
    : battingRuns;
  const strikeRate = battingBalls > 0
    ? Number(((battingRuns / battingBalls) * 100).toFixed(2))
    : 0;

  const economy = bowlingOvers > 0
    ? Number((bowlingRuns / bowlingOvers).toFixed(2))
    : 0;

  let bestFigures = '-';
  if (bowlingMatchFigures.length > 0) {
    const best = bowlingMatchFigures.reduce((prev, curr) => {
      if (curr.wickets > prev.wickets) return curr;
      if (curr.wickets === prev.wickets && curr.runs < prev.runs) return curr;
      return prev;
    }, { wickets: 0, runs: 999 });
    if (best.wickets > 0) bestFigures = `${best.wickets}/${best.runs}`;
  }

  return {
    matches: matchesPlayedSet.size,
    batting: {
      matches: battingInnings,
      innings: battingInnings,
      runs: battingRuns,
      balls: battingBalls,
      fours: battingFours,
      sixes: battingSixes,
      highScore: battingHighScore,
      notOuts: battingNotOuts,
      average: battingAverage,
      strikeRate
    },
    bowling: {
      matches: bowlingInnings,
      innings: bowlingInnings,
      overs: Number(bowlingOvers.toFixed(1)),
      runs: bowlingRuns,
      wickets: bowlingWickets,
      bestFigures,
      economy
    },
    fielding: {
      catches: fieldingCatches,
      runOuts: fieldingRunOuts
    }
  };
};

export const getTopBatsmen = async (limit = 5) => {
  const matches = await Match.find({ status: MATCH_STATUS.COMPLETED })
    .populate('teamA', 'name shortName logo')
    .populate('teamB', 'name shortName logo')
    .lean();

  const playerStats = {};

  for (const match of matches) {
    for (const innings of (match.innings || [])) {
      for (const b of (innings.batting || [])) {
        if (!b.player) continue;
        const id = b.player.toString();
        if (!playerStats[id]) {
          playerStats[id] = { runs: 0, balls: 0, fours: 0, sixes: 0, playerId: b.player };
        }
        playerStats[id].runs += computeRuns(b);
        playerStats[id].balls += b.balls || 0;
        playerStats[id].fours += b.fours || 0;
        playerStats[id].sixes += b.sixes || 0;
      }
    }
  }

  const sorted = Object.values(playerStats)
    .sort((a, b) => b.runs - a.runs)
    .slice(0, limit);

  const playerIds = sorted.map(s => s.playerId);
  const players = await Player.find({ _id: { $in: playerIds } })
    .populate('team', 'name shortName logo')
    .lean();

  const playerMap = {};
  players.forEach(p => { playerMap[p._id.toString()] = p; });

  return sorted.map((s, index) => {
    const player = playerMap[s.playerId?.toString()] || {};
    const strikeRate = s.balls ? ((s.runs / s.balls) * 100).toFixed(2) : 0;
    return {
      rank: index + 1,
      id: s.playerId,
      name: player.name || 'Unknown',
      team: player.team?.shortName || 'N/A',
      teamLogo: player.team?.logo,
      runs: s.runs,
      balls: s.balls,
      fours: s.fours,
      sixes: s.sixes,
      strikeRate: Number(strikeRate)
    };
  });
};

export const getTopBowlers = async (limit = 5) => {
  const matches = await Match.find({ status: MATCH_STATUS.COMPLETED }).lean();

  const playerStats = {};

  for (const match of matches) {
    for (const innings of (match.innings || [])) {
      for (const b of (innings.bowling || [])) {
        if (!b.player) continue;
        const id = b.player.toString();
        if (!playerStats[id]) {
          playerStats[id] = { wickets: 0, runs: 0, overs: 0, playerId: b.player };
        }
        playerStats[id].wickets += b.wickets || 0;
        playerStats[id].overs += b.overs || 0;
        const runs = b.runs != null
          ? b.runs
          : (b.runsPerOver || []).reduce((s, r) => s + r, 0);
        playerStats[id].runs += runs;
      }
    }
  }

  const sorted = Object.values(playerStats)
    .sort((a, b) => b.wickets - a.wickets || a.runs - b.runs)
    .slice(0, limit);

  const playerIds = sorted.map(s => s.playerId);
  const players = await Player.find({ _id: { $in: playerIds } })
    .populate('team', 'name shortName logo')
    .lean();

  const playerMap = {};
  players.forEach(p => { playerMap[p._id.toString()] = p; });

  return sorted.map((s, index) => {
    const player = playerMap[s.playerId?.toString()] || {};
    const economy = s.overs > 0 ? (s.runs / s.overs).toFixed(2) : 0;
    return {
      rank: index + 1,
      id: s.playerId,
      name: player.name || 'Unknown',
      team: player.team?.shortName || 'N/A',
      teamLogo: player.team?.logo,
      wickets: s.wickets,
      runs: s.runs,
      overs: s.overs.toFixed(1),
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

  if (!match || match.status !== MATCH_STATUS.COMPLETED) return;

  const teamAId = match.teamA._id.toString();
  const teamBId = match.teamB._id.toString();
  const winnerId = match.winner?._id?.toString();

  const innings1 = match.innings[0];
  const innings2 = match.innings[1];

  if (!innings1) return;

  let teamABattingRuns = 0, teamABattingOvers = 0;
  let teamBBattingRuns = 0, teamBBattingOvers = 0;

  if (innings1.battingTeam?.toString() === teamAId) {
    teamABattingRuns = innings1.runs || 0;
    teamABattingOvers = innings1.overs || 0;
  } else {
    teamBBattingRuns = innings1.runs || 0;
    teamBBattingOvers = innings1.overs || 0;
  }

  if (innings2) {
    if (innings2.battingTeam?.toString() === teamAId) {
      teamABattingRuns = innings2.runs || 0;
      teamABattingOvers = innings2.overs || 0;
    } else {
      teamBBattingRuns = innings2.runs || 0;
      teamBBattingOvers = innings2.overs || 0;
    }
  }

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
    teamAUpdate.$inc['stats.ties'] = 1;
    teamAUpdate.$inc['stats.points'] = 1;
  }

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

  await Team.findByIdAndUpdate(teamAId, teamAUpdate);
  await Team.findByIdAndUpdate(teamBId, teamBUpdate);
  await recalculateTeamNRR(teamAId);
  await recalculateTeamNRR(teamBId);
};

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

// Update player career stats for all players involved in a match
export const updatePlayerStatsFromMatch = async (matchId) => {
  const match = await Match.findById(matchId).lean();
  if (!match) return;

  const playersToUpdate = new Set();

  for (const innings of (match.innings || [])) {
    (innings.batting || []).forEach(b => { if (b.player) playersToUpdate.add(b.player.toString()); });
    (innings.bowling || []).forEach(b => { if (b.player) playersToUpdate.add(b.player.toString()); });
    // Also collect fielders
    (innings.batting || []).forEach(b => { if (b.fielder) playersToUpdate.add(b.fielder.toString()); });
  }

  for (const playerId of playersToUpdate) {
    try {
      const stats = await derivePlayerStats(playerId);
      await Player.findByIdAndUpdate(playerId, {
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
        'stats.bowling.runs': stats.bowling.runs,
        'stats.bowling.wickets': stats.bowling.wickets,
        'stats.bowling.bestFigures': stats.bowling.bestFigures,
        'stats.bowling.economy': stats.bowling.economy,
        'stats.fielding.catches': stats.fielding.catches,
        'stats.fielding.runOuts': stats.fielding.runOuts
      });
    } catch (error) {
      console.error(`[Stats] Failed to update player ${playerId}:`, error);
    }
  }

  console.log(`[Stats] Updated ${playersToUpdate.size} players for match:`, matchId);
};

export const updateAllStatsOnMatchComplete = async (matchId) => {
  console.log('[Stats] Updating all stats for completed match:', matchId);
  await updateTeamStatsOnMatchComplete(matchId);
  await updatePlayerStatsFromMatch(matchId);
  console.log('[Stats] All stats updated');
};
