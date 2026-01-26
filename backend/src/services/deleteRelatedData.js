import Ball from "../models/Ball.js";

export const deleteMatchRelatedData = async (matchId) => {
  // Delete all balls related to the match
  await Ball.deleteMany({ match: matchId });
  // TODO: Add similar deletions for stats, points, etc. if models exist
};
