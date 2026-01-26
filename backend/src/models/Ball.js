import mongoose from "mongoose";

const ballSchema = new mongoose.Schema(
  {
    match: { type: mongoose.Schema.Types.ObjectId, ref: "Match", required: true, index: true },
    innings: { type: Number, required: true, default: 1 }, // 1 or 2 to distinguish innings
    over: { type: Number, required: true },
    ball: { type: Number, required: true },
    // Unique identifier for each delivery (including extras) - auto-incremented per match/innings
    deliveryNumber: { type: Number, required: true },
    battingTeam: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
    bowlingTeam: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
    // Player references (optional, for linking to player stats)
    strikerId: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
    nonStrikerId: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
    bowlerId: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
    // Player names (for display and quick access)
    striker: { type: String },
    nonStriker: { type: String },
    bowler: { type: String },
    runsOffBat: { type: Number, default: 0 },
    extras: { type: Number, default: 0 },
    extraType: { type: String, enum: ['wide', 'noball', 'bye', 'legbye', null] },
    wicket: { type: Boolean, default: false },
    dismissal: { type: mongoose.Schema.Types.Mixed }
  },
  { timestamps: true }
);

// Index for querying balls - NOT unique to allow extras on same ball number
// Unique constraint is on match + innings + deliveryNumber instead
ballSchema.index({ match: 1, innings: 1, over: 1, ball: 1 });
ballSchema.index({ match: 1, innings: 1, deliveryNumber: 1 }, { unique: true });

export default mongoose.model("Ball", ballSchema);
