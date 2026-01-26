import { createTeam, updateTeam, getTeams, getTeamById, deleteTeam, getPointsTable, updateTeamStats } from "../services/teamService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { created, ok } from "../config/response.js";

export const create = asyncHandler(async (req, res) => {
  const data = await createTeam(req.body);
  return created(res, data, "team_created");
});

export const update = asyncHandler(async (req, res) => {
  const data = await updateTeam(req.params.teamId, req.body);
  return ok(res, data, "team_updated");
});

export const list = asyncHandler(async (req, res) => {
  const data = await getTeams();
  return ok(res, data, "teams");
});

export const getById = asyncHandler(async (req, res) => {
  const data = await getTeamById(req.params.teamId);
  return ok(res, data, "team");
});

export const remove = asyncHandler(async (req, res) => {
  await deleteTeam(req.params.teamId);
  return ok(res, null, "team_deleted");
});

export const pointsTable = asyncHandler(async (req, res) => {
  const data = await getPointsTable();
  return ok(res, data, "points_table");
});

export const updateStats = asyncHandler(async (req, res) => {
  const data = await updateTeamStats(req.params.teamId, req.body);
  return ok(res, data, "team_stats_updated");
});
