import jwt from "jsonwebtoken";
import Organizer from "../models/Organizer.js";
import { ApiError } from "../utils/apiError.js";
import { env } from "../config/env.js";

export const loginOrganizer = async ({ email, password }) => {
  const organizer = await Organizer.findOne({ email: email.toLowerCase() });
  if (!organizer) throw new ApiError("Invalid credentials", 401);

  const valid = await organizer.comparePassword(password);
  if (!valid) throw new ApiError("Invalid credentials", 401);

  const token = jwt.sign({ id: organizer._id }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
  return { token, organizer: { id: organizer._id, name: organizer.name, email: organizer.email } };
};
