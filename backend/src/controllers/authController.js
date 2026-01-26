import { loginOrganizer } from "../services/authService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ok } from "../config/response.js";

export const login = asyncHandler(async (req, res) => {
  const data = await loginOrganizer(req.body);
  return ok(res, data, "login_success");
});
