import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const organizerSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true }
  },
  { timestamps: true }
);

organizerSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

export default mongoose.model("Organizer", organizerSchema);
