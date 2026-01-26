import Player from "../models/Player.js";
import Team from "../models/Team.js";
import { ApiError } from "../utils/apiError.js";

export const getPlayers = async (teamId) => {
  const query = teamId ? { team: teamId } : {};
  const players = await Player.find(query)
    .populate('team', 'name shortName logo primaryColor')
    .sort({ name: 1 })
    .lean();
  return players.map(player => ({
    ...player,
    id: player._id.toString(),
    team: player.team ? { ...player.team, id: player.team._id.toString() } : null
  }));
};

export const createPlayer = async (payload) => {
  const team = await Team.findById(payload.teamId);
  if (!team) throw new ApiError("Team not found", 404);

  return Player.create({
    team: payload.teamId,
    name: payload.name,
    jerseyNumber: payload.jerseyNumber,
    role: payload.role || 'Batsman',
    battingStyle: payload.battingStyle || 'Right-hand',
    bowlingStyle: payload.bowlingStyle || 'None',
    imageUrl: payload.imageUrl || null,
    isCaptain: payload.isCaptain || false,
    isActive: true,
    stats: {
      matches: 0,
      batting: { matches: 0, innings: 0, runs: 0, balls: 0, fours: 0, sixes: 0, highScore: 0, notOuts: 0, average: 0, strikeRate: 0 },
      bowling: { matches: 0, innings: 0, overs: 0, balls: 0, runs: 0, wickets: 0, bestFigures: '-', economy: 0, average: 0 },
      fielding: { catches: 0, runOuts: 0, stumpings: 0 }
    }
  });
};

export const createManyPlayers = async (teamId, playersArray) => {
  const team = await Team.findById(teamId);
  if (!team) throw new ApiError("Team not found", 404);

  const players = playersArray.map(p => ({
    team: teamId,
    name: p.name,
    jerseyNumber: p.jerseyNumber,
    role: p.role || 'Batsman',
    battingStyle: p.battingStyle || 'Right-hand',
    bowlingStyle: p.bowlingStyle || 'None',
    imageUrl: p.imageUrl || null,
    isCaptain: p.isCaptain || false,
    isActive: true,
    stats: {
      matches: 0,
      batting: {},
      bowling: {},
      fielding: {}
    }
  }));

  return Player.insertMany(players);
};

export const deletePlayer = async (playerId) => {
  const player = await Player.findByIdAndDelete(playerId);
  if (!player) throw new ApiError("Player not found", 404);
  return player;
};

export const deletePlayersByTeam = async (teamId) => {
  return Player.deleteMany({ team: teamId });
};

export const updatePlayer = async (playerId, payload) => {
  const updateData = {};
  
  if (payload.name !== undefined) updateData.name = payload.name;
  if (payload.jerseyNumber !== undefined) updateData.jerseyNumber = payload.jerseyNumber;
  if (payload.role !== undefined) updateData.role = payload.role;
  if (payload.battingStyle !== undefined) updateData.battingStyle = payload.battingStyle;
  if (payload.bowlingStyle !== undefined) updateData.bowlingStyle = payload.bowlingStyle;
  if (payload.imageUrl !== undefined) updateData.imageUrl = payload.imageUrl;
  if (payload.isCaptain !== undefined) updateData.isCaptain = payload.isCaptain;
  if (payload.isActive !== undefined) updateData.isActive = payload.isActive;
  if (payload.teamId !== undefined) updateData.team = payload.teamId;
  if (payload.stats !== undefined) updateData.stats = payload.stats;

  const player = await Player.findByIdAndUpdate(playerId, updateData, { new: true });
  if (!player) throw new ApiError("Player not found", 404);
  return player;
};

export const updatePlayerStats = async (playerId, statsUpdate) => {
  const player = await Player.findById(playerId);
  if (!player) throw new ApiError("Player not found", 404);

  // Deep merge stats
  if (statsUpdate.batting) {
    player.stats.batting = { ...player.stats.batting.toObject(), ...statsUpdate.batting };
    // Calculate average and strike rate
    const innings = player.stats.batting.innings - player.stats.batting.notOuts;
    player.stats.batting.average = innings > 0 ? Number((player.stats.batting.runs / innings).toFixed(2)) : 0;
    player.stats.batting.strikeRate = player.stats.batting.balls > 0 
      ? Number(((player.stats.batting.runs / player.stats.batting.balls) * 100).toFixed(2)) : 0;
  }
  if (statsUpdate.bowling) {
    player.stats.bowling = { ...player.stats.bowling.toObject(), ...statsUpdate.bowling };
    // Calculate economy and average
    player.stats.bowling.economy = player.stats.bowling.overs > 0 
      ? Number((player.stats.bowling.runs / player.stats.bowling.overs).toFixed(2)) : 0;
    player.stats.bowling.average = player.stats.bowling.wickets > 0 
      ? Number((player.stats.bowling.runs / player.stats.bowling.wickets).toFixed(2)) : 0;
  }
  if (statsUpdate.fielding) {
    player.stats.fielding = { ...player.stats.fielding.toObject(), ...statsUpdate.fielding };
  }
  if (statsUpdate.matches !== undefined) {
    player.stats.matches = statsUpdate.matches;
  }

  await player.save();
  return player;
};

export const getPlayerById = async (playerId) => {
  const player = await Player.findById(playerId)
    .populate('team', 'name shortName logo primaryColor')
    .lean();
  if (!player) throw new ApiError("Player not found", 404);
  return {
    ...player,
    id: player._id.toString(),
    team: player.team ? { ...player.team, id: player.team._id.toString() } : null
  };
};

export const getTopBatsmen = async (limit = 10) => {
  const players = await Player.find({ 'stats.batting.runs': { $gt: 0 } })
    .sort({ 'stats.batting.runs': -1 })
    .limit(limit)
    .populate('team', 'name shortName logo primaryColor')
    .lean();
  return players.map(player => ({
    ...player,
    id: player._id.toString(),
    team: player.team ? { ...player.team, id: player.team._id.toString() } : null
  }));
};

export const getTopBowlers = async (limit = 10) => {
  const players = await Player.find({ 'stats.bowling.wickets': { $gt: 0 } })
    .sort({ 'stats.bowling.wickets': -1 })
    .limit(limit)
    .populate('team', 'name shortName logo primaryColor')
    .lean();
  return players.map(player => ({
    ...player,
    id: player._id.toString(),
    team: player.team ? { ...player.team, id: player.team._id.toString() } : null
  }));
};
