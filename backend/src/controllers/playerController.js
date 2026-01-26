import { createPlayer, updatePlayer, getPlayerById, getPlayers, deletePlayer, updatePlayerStats, getTopBatsmen, getTopBowlers } from "../services/playerService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { created, ok } from "../config/response.js";

export const list = asyncHandler(async (req, res) => {
  const data = await getPlayers(req.query.team);
  return ok(res, data, "players");
});

export const create = asyncHandler(async (req, res) => {
  const data = await createPlayer(req.body);
  return created(res, data, "player_created");
});

export const update = asyncHandler(async (req, res) => {
  const data = await updatePlayer(req.params.playerId, req.body);
  return ok(res, data, "player_updated");
});

export const getById = asyncHandler(async (req, res) => {
  const data = await getPlayerById(req.params.playerId);
  return ok(res, data, "player");
});

export const remove = asyncHandler(async (req, res) => {
  await deletePlayer(req.params.playerId);
  return ok(res, null, "player_deleted");
});

export const updateStats = asyncHandler(async (req, res) => {
  const data = await updatePlayerStats(req.params.playerId, req.body);
  return ok(res, data, "player_stats_updated");
});

export const topBatsmen = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const data = await getTopBatsmen(limit);
  return ok(res, data, "top_batsmen");
});

export const topBowlers = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const data = await getTopBowlers(limit);
  return ok(res, data, "top_bowlers");
});
