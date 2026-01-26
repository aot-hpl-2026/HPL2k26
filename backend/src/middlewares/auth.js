import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import Organizer from "../models/Organizer.js";
import { ApiError } from "../utils/apiError.js";

export const requireAuth = async (req, res, next) => {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) throw new ApiError("Unauthorized", 401);

    const payload = jwt.verify(token, env.jwtSecret);
    const organizer = await Organizer.findById(payload.id);
    if (!organizer) throw new ApiError("Unauthorized", 401);

    req.organizer = organizer;
    next();
  } catch (error) {
    next(new ApiError("Unauthorized", 401));
  }
};
