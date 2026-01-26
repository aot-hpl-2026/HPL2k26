import { getPointsTable } from "../services/pointsService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ok } from "../config/response.js";

export const list = asyncHandler(async (req, res) => {
  const data = await getPointsTable();
  return ok(res, data, "points_table");
});
