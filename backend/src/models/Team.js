import mongoose from "mongoose";

const teamStatsSchema = new mongoose.Schema({
  matchesPlayed: { type: Number, default: 0 },
  wins: { type: Number, default: 0 },
  losses: { type: Number, default: 0 },
  ties: { type: Number, default: 0 },
  points: { type: Number, default: 0 },
  nrr: { type: Number, default: 0 },
  runsScored: { type: Number, default: 0 },
  runsConceded: { type: Number, default: 0 },
  oversPlayed: { type: Number, default: 0 },
  oversBowled: { type: Number, default: 0 }
}, { _id: false });

const teamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    shortName: { type: String, required: true },
    logo: { type: String },
    primaryColor: { type: String, default: '#8B1538' },
    secondaryColor: { type: String, default: '#FFD700' },
    hostel: { type: String },
    captain: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
    description: { type: String },
    motto: { type: String },
    stats: { type: teamStatsSchema, default: () => ({}) }
  },
  { timestamps: true }
);

// Virtual for id
teamSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

teamSchema.set('toJSON', { virtuals: true });
teamSchema.set('toObject', { virtuals: true });

export default mongoose.model("Team", teamSchema);
