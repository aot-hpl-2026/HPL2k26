import Match from "../models/Match.js";
import Team from "../models/Team.js";
import { ApiError } from "../utils/apiError.js";
import { MATCH_STATUS } from "../config/constants.js";

export const createMatch = async (payload) => {
  const teamA = await Team.findById(payload.teamA);
  const teamB = await Team.findById(payload.teamB);
  if (!teamA || !teamB) throw new ApiError("Invalid teams", 400);

  // Get next match number
  const lastMatch = await Match.findOne().sort({ matchNumber: -1 });
  const matchNumber = (lastMatch?.matchNumber || 0) + 1;

  return Match.create({
    matchNumber,
    teamA: payload.teamA,
    teamB: payload.teamB,
    venue: payload.venue || 'LPU Stadium',
    scheduledAt: payload.scheduledAt,
    overs: payload.overs || 6,
    status: MATCH_STATUS.SCHEDULED
  });
};

export const updateMatch = async (matchId, payload, session = null) => {
  const options = { new: true };
  if (session) options.session = session;

  const updateData = {};
  if (payload.venue !== undefined) updateData.venue = payload.venue;
  if (payload.scheduledAt !== undefined) updateData.scheduledAt = payload.scheduledAt;
  if (payload.status !== undefined) updateData.status = payload.status;
  if (payload.result !== undefined) updateData.result = payload.result;
  if (payload.winner !== undefined) updateData.winner = payload.winner;
  if (payload.overs !== undefined) updateData.overs = payload.overs;
  if (payload.toss !== undefined) updateData.toss = payload.toss;
  if (payload.currentInnings !== undefined) updateData.currentInnings = payload.currentInnings;
  if (payload.score !== undefined) updateData.score = payload.score;
  if (payload.innings !== undefined) updateData.innings = payload.innings;
  if (payload.currentBatsmen !== undefined) updateData.currentBatsmen = payload.currentBatsmen;
  if (payload.currentBowler !== undefined) updateData.currentBowler = payload.currentBowler;
  if (payload.recentBalls !== undefined) updateData.recentBalls = payload.recentBalls;

  const match = await Match.findByIdAndUpdate(matchId, updateData, options);
  if (!match) throw new ApiError("Match not found", 404);
  return match;
};

// Helper to add id fields to match and nested teams
const addIdFields = (match) => {
  if (!match) return null;
  return {
    ...match,
    id: match._id.toString(),
    teamA: match.teamA ? { ...match.teamA, id: match.teamA._id.toString() } : null,
    teamB: match.teamB ? { ...match.teamB, id: match.teamB._id.toString() } : null,
    winner: match.winner ? { ...match.winner, id: match.winner._id.toString() } : null
  };
};

export const getMatches = async () => {
  const matches = await Match.find()
    .populate('teamA', 'name shortName logo primaryColor')
    .populate('teamB', 'name shortName logo primaryColor')
    .populate('winner', 'name shortName')
    .sort({ scheduledAt: -1 })
    .lean();
  return matches.map(addIdFields);
};

export const getLiveMatches = async () => {
  const matches = await Match.find({ status: MATCH_STATUS.LIVE })
    .populate('teamA', 'name shortName logo primaryColor')
    .populate('teamB', 'name shortName logo primaryColor')
    .sort({ scheduledAt: -1 })
    .lean();
  return matches.map(addIdFields);
};

export const getUpcomingMatches = async () => {
  const matches = await Match.find({ status: { $in: [MATCH_STATUS.SCHEDULED, MATCH_STATUS.UPCOMING] } })
    .populate('teamA', 'name shortName logo primaryColor')
    .populate('teamB', 'name shortName logo primaryColor')
    .sort({ scheduledAt: 1 })
    .lean();
  return matches.map(addIdFields);
};

export const getCompletedMatches = async () => {
  const matches = await Match.find({ status: MATCH_STATUS.COMPLETED })
    .populate('teamA', 'name shortName logo primaryColor')
    .populate('teamB', 'name shortName logo primaryColor')
    .populate('winner', 'name shortName')
    .sort({ scheduledAt: -1 })
    .lean();
  return matches.map(addIdFields);
};

export const getMatchById = async (matchId) => {
  const match = await Match.findById(matchId)
    .populate('teamA', 'name shortName logo primaryColor secondaryColor')
    .populate('teamB', 'name shortName logo primaryColor secondaryColor')
    .populate('winner', 'name shortName')
    .lean();
  if (!match) throw new ApiError("Match not found", 404);
  return addIdFields(match);
};


import { deleteMatchRelatedData } from "./deleteRelatedData.js";

export const deleteMatch = async (matchId) => {
  // Delete related data first
  await deleteMatchRelatedData(matchId);
  const match = await Match.findByIdAndDelete(matchId);
  if (!match) throw new ApiError("Match not found", 404);
  return match;
};

export const getMatchesByTeam = async (teamId) => {
  const matches = await Match.find({ $or: [{ teamA: teamId }, { teamB: teamId }] })
    .populate('teamA', 'name shortName logo primaryColor')
    .populate('teamB', 'name shortName logo primaryColor')
    .populate('winner', 'name shortName')
    .sort({ scheduledAt: -1 })
    .lean();
  return matches.map(addIdFields);
};
