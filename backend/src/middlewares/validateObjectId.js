import mongoose from "mongoose";
import { ApiError } from "../utils/apiError.js";

export const validateObjectId = (param) => (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params[param])) {
    return next(new ApiError("Invalid ID", 400));
  }
  next();
};
