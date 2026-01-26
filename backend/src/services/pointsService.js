import Team from "../models/Team.js";

export const getPointsTable = async () => {
  return Team.find()
    .sort({ 'stats.points': -1, 'stats.nrr': -1 })
    .select('name shortName logo primaryColor stats')
    .lean();
};
