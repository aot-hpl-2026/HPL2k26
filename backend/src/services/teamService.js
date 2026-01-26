import Team from "../models/Team.js";
import Player from "../models/Player.js";
import { ApiError } from "../utils/apiError.js";

export const createTeam = async (payload) => {
  const team = await Team.create({
    name: payload.name,
    shortName: payload.shortName,
    logo: payload.logo || null,
    primaryColor: payload.primaryColor || '#8B1538',
    secondaryColor: payload.secondaryColor || '#FFD700',
    hostel: payload.hostel || '',
    description: payload.description || '',
    motto: payload.motto || '',
    stats: {
      matchesPlayed: 0,
      wins: 0,
      losses: 0,
      ties: 0,
      points: 0,
      nrr: 0
    }
  });

  return team;
};

export const updateTeam = async (teamId, payload) => {
  const updateData = {};
  
  if (payload.name !== undefined) updateData.name = payload.name;
  if (payload.shortName !== undefined) updateData.shortName = payload.shortName;
  if (payload.logo !== undefined) updateData.logo = payload.logo;
  if (payload.primaryColor !== undefined) updateData.primaryColor = payload.primaryColor;
  if (payload.secondaryColor !== undefined) updateData.secondaryColor = payload.secondaryColor;
  if (payload.hostel !== undefined) updateData.hostel = payload.hostel;
  if (payload.description !== undefined) updateData.description = payload.description;
  if (payload.motto !== undefined) updateData.motto = payload.motto;
  if (payload.captain !== undefined) updateData.captain = payload.captain;
  if (payload.stats !== undefined) updateData.stats = payload.stats;

  const team = await Team.findByIdAndUpdate(teamId, updateData, { new: true });
  if (!team) throw new ApiError("Team not found", 404);

  return team;
};

export const updateTeamStats = async (teamId, statsUpdate) => {
  const team = await Team.findById(teamId);
  if (!team) throw new ApiError("Team not found", 404);

  // Merge stats
  team.stats = {
    ...team.stats.toObject(),
    ...statsUpdate
  };

  // Calculate points (2 for win, 1 for tie)
  team.stats.points = (team.stats.wins * 2) + (team.stats.ties * 1);

  // Calculate NRR
  if (team.stats.oversBowled > 0 && team.stats.oversPlayed > 0) {
    const runRateFor = team.stats.runsScored / team.stats.oversPlayed;
    const runRateAgainst = team.stats.runsConceded / team.stats.oversBowled;
    team.stats.nrr = Number((runRateFor - runRateAgainst).toFixed(3));
  }

  await team.save();
  return team;
};

export const deleteTeam = async (teamId) => {
  const team = await Team.findByIdAndDelete(teamId);
  if (!team) throw new ApiError("Team not found", 404);
  // Also delete all players from this team
  await Player.deleteMany({ team: teamId });
  return team;
};

export const getTeams = async () => {
  const teams = await Team.find().sort({ 'stats.points': -1, 'stats.nrr': -1 }).lean();
  return teams.map(team => ({ ...team, id: team._id.toString() }));
};

export const getTeamById = async (teamId) => {
  const team = await Team.findById(teamId).lean();
  if (!team) throw new ApiError("Team not found", 404);
  return { ...team, id: team._id.toString() };
};

export const getPointsTable = async () => {
  const teams = await Team.find()
    .sort({ 'stats.points': -1, 'stats.nrr': -1 })
    .select('name shortName logo primaryColor stats hostel')
    .lean();
  return teams.map(team => ({ ...team, id: team._id.toString() }));
};
