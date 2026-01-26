import mongoose from "mongoose";
import { MATCH_STATUS } from "../config/constants.js";

const playerScoreSchema = new mongoose.Schema({
  player: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
  name: { type: String },
  runs: { type: Number, default: 0 },
  balls: { type: Number, default: 0 },
  fours: { type: Number, default: 0 },
  sixes: { type: Number, default: 0 },
  isOut: { type: Boolean, default: false },
  dismissal: { type: String },
  onStrike: { type: Boolean, default: false }
}, { _id: false });

const bowlerScoreSchema = new mongoose.Schema({
  player: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
  name: { type: String },
  overs: { type: Number, default: 0 },
  maidens: { type: Number, default: 0 },
  runs: { type: Number, default: 0 },
  wickets: { type: Number, default: 0 },
  economy: { type: Number, default: 0 }
}, { _id: false });

const inningsSchema = new mongoose.Schema({
  battingTeam: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
  bowlingTeam: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
  runs: { type: Number, default: 0 },
  wickets: { type: Number, default: 0 },
  overs: { type: Number, default: 0 },
  runRate: { type: Number, default: 0 },
  batting: [playerScoreSchema],
  bowling: [bowlerScoreSchema],
  currentBatsmen: [playerScoreSchema],
  currentBowler: bowlerScoreSchema,
  recentBalls: [{ type: String }]
}, { _id: false });

const matchSchema = new mongoose.Schema(
  {
    matchNumber: { type: Number },
    teamA: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
    teamB: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
    venue: { type: String, default: 'LPU Stadium' },
    scheduledAt: { type: Date, required: true },
    overs: { type: Number, default: 6 },
    status: { type: String, enum: Object.values(MATCH_STATUS), default: MATCH_STATUS.SCHEDULED },
    result: { type: String },
    winner: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
    toss: {
      winner: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
      decision: { type: String, enum: ["bat", "bowl"] }
    },
    currentInnings: { type: Number, default: 1 },
    innings: [inningsSchema],
    // Current score (active innings)
    score: {
      runs: { type: Number, default: 0 },
      wickets: { type: Number, default: 0 },
      overs: { type: Number, default: 0 },
      runRate: { type: Number, default: 0 }
    },
    // Current batsmen and bowler for live display
    currentBatsmen: [playerScoreSchema],
    currentBowler: bowlerScoreSchema,
    recentBalls: [{ type: String }]
  },
  { timestamps: true }
);

matchSchema.index({ scheduledAt: 1 });
matchSchema.index({ status: 1 });

// Virtual for id
matchSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Virtuals for team1/team2 (alias for teamA/teamB)
matchSchema.virtual('team1', {
  ref: 'Team',
  localField: 'teamA',
  foreignField: '_id',
  justOne: true
});

matchSchema.virtual('team2', {
  ref: 'Team',
  localField: 'teamB',
  foreignField: '_id',
  justOne: true
});

matchSchema.set('toJSON', { virtuals: true });
matchSchema.set('toObject', { virtuals: true });

export default mongoose.model("Match", matchSchema);
