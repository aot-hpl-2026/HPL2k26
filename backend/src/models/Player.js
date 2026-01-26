import mongoose from "mongoose";

const battingStatsSchema = new mongoose.Schema({
  matches: { type: Number, default: 0 },
  innings: { type: Number, default: 0 },
  runs: { type: Number, default: 0 },
  balls: { type: Number, default: 0 },
  fours: { type: Number, default: 0 },
  sixes: { type: Number, default: 0 },
  highScore: { type: Number, default: 0 },
  notOuts: { type: Number, default: 0 },
  average: { type: Number, default: 0 },
  strikeRate: { type: Number, default: 0 }
}, { _id: false });

const bowlingStatsSchema = new mongoose.Schema({
  matches: { type: Number, default: 0 },
  innings: { type: Number, default: 0 },
  overs: { type: Number, default: 0 },
  balls: { type: Number, default: 0 },
  runs: { type: Number, default: 0 },
  wickets: { type: Number, default: 0 },
  bestFigures: { type: String, default: '-' },
  economy: { type: Number, default: 0 },
  average: { type: Number, default: 0 }
}, { _id: false });

const fieldingStatsSchema = new mongoose.Schema({
  catches: { type: Number, default: 0 },
  runOuts: { type: Number, default: 0 },
  stumpings: { type: Number, default: 0 }
}, { _id: false });

const playerStatsSchema = new mongoose.Schema({
  matches: { type: Number, default: 0 },
  batting: { type: battingStatsSchema, default: () => ({}) },
  bowling: { type: bowlingStatsSchema, default: () => ({}) },
  fielding: { type: fieldingStatsSchema, default: () => ({}) }
}, { _id: false });

const playerSchema = new mongoose.Schema(
  {
    team: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true, index: true },
    name: { type: String, required: true },
    jerseyNumber: { type: Number },
    role: { type: String, enum: ['Batsman', 'Bowler', 'All-Rounder', 'Wicket-Keeper'], default: 'Batsman' },
    battingStyle: { type: String, enum: ['Right-hand', 'Left-hand'], default: 'Right-hand' },
    bowlingStyle: { type: String, default: 'None' },
    imageUrl: { type: String },
    isCaptain: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    stats: { type: playerStatsSchema, default: () => ({}) }
  },
  { timestamps: true }
);

playerSchema.index({ team: 1, name: 1 }, { unique: true });

// Virtual for id
playerSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

playerSchema.set('toJSON', { virtuals: true });
playerSchema.set('toObject', { virtuals: true });

export default mongoose.model("Player", playerSchema);
