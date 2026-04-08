import mongoose from "mongoose";
import { MATCH_STATUS } from "../config/constants.js";

const batsmanEntrySchema = new mongoose.Schema({
  player: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
  name: { type: String },
  ones: { type: Number, default: 0 },
  twos: { type: Number, default: 0 },
  threes: { type: Number, default: 0 },
  fours: { type: Number, default: 0 },
  fives: { type: Number, default: 0 },
  sixes: { type: Number, default: 0 },
  balls: { type: Number, default: 0 },
  runs: { type: Number, default: 0 },
  isOut: { type: Boolean, default: false },
  dismissalType: { type: String, enum: ['caught', 'bowled', 'lbw', 'run_out', null], default: null },
  bowler: { type: mongoose.Schema.Types.ObjectId, ref: "Player", default: null },
  fielder: { type: mongoose.Schema.Types.ObjectId, ref: "Player", default: null },
  dismissal: { type: String, default: null }
}, { _id: false });

const bowlerEntrySchema = new mongoose.Schema({
  player: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
  name: { type: String },
  overs: { type: Number, default: 0 },
  wickets: { type: Number, default: 0 },
  wides: { type: Number, default: 0 },
  noBalls: { type: Number, default: 0 },
  runsPerOver: [{ type: Number }],
  runs: { type: Number, default: 0 },
  economy: { type: Number, default: 0 }
}, { _id: false });

const inningsSchema = new mongoose.Schema({
  battingTeam: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
  bowlingTeam: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
  batting: [batsmanEntrySchema],
  bowling: [bowlerEntrySchema],
  runs: { type: Number, default: 0 },
  wickets: { type: Number, default: 0 },
  overs: { type: Number, default: 0 },
  extras: { type: Number, default: 0 },
  penaltyRuns: { type: Number, default: 0 }
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
    currentInnings: { type: Number, default: 0 },
    innings: [inningsSchema]
  },
  { timestamps: true }
);

matchSchema.index({ scheduledAt: 1 });
matchSchema.index({ status: 1 });

matchSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

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
