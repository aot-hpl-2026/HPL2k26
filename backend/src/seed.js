// Seed script to create initial admin and HPL 2026 teams
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import dns from "dns";

dotenv.config();

// Define schemas inline to avoid module import issues
const organizerSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  name: { type: String, required: true }
}, { timestamps: true });

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

const teamSchema = new mongoose.Schema({
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
}, { timestamps: true });

const Organizer = mongoose.models.Organizer || mongoose.model("Organizer", organizerSchema);
const Team = mongoose.models.Team || mongoose.model("Team", teamSchema);

// HPL 2026 Teams Data
const teamsData = [
  {
    name: 'Narayani Sena',
    shortName: 'NS',
    logo: '/images/teams/NS.png',
    primaryColor: '#8B1538',
    secondaryColor: '#D4AF37',
    hostel: 'Hostel A',
    description: 'The divine army, known for their strategic brilliance and unwavering spirit. They fight not just to win, but to inspire.',
    motto: 'Strength Through Unity',
    stats: { matchesPlayed: 0, wins: 0, losses: 0, ties: 0, points: 0, nrr: 0 }
  },
  {
    name: 'Kurukshetra Kings',
    shortName: 'KK',
    logo: '/images/teams/KK.png',
    primaryColor: '#1B1F3B',
    secondaryColor: '#C0C0C0',
    hostel: 'Hostel B',
    description: 'Masters of the battlefield, the Kings dominate with royal precision. Every match is their Kurukshetra.',
    motto: 'Conquer With Honor',
    stats: { matchesPlayed: 0, wins: 0, losses: 0, ties: 0, points: 0, nrr: 0 }
  },
  {
    name: 'Barbarika XI',
    shortName: 'BXI',
    logo: '/images/teams/BB.png',
    primaryColor: '#4169E1',
    secondaryColor: '#FFD700',
    hostel: 'Hostel C',
    description: 'Named after the legendary warrior who could end wars with three arrows. Swift, precise, deadly.',
    motto: 'Three Arrows, One Victory',
    stats: { matchesPlayed: 0, wins: 0, losses: 0, ties: 0, points: 0, nrr: 0 }
  },
  {
    name: 'Indraprastha Warriors',
    shortName: 'IW',
    logo: '/images/teams/IP.png',
    primaryColor: '#CD7F32',
    secondaryColor: '#2F4F4F',
    hostel: 'Hostel D',
    description: 'From the legendary city of the Pandavas. Warriors who turn every challenge into triumph.',
    motto: 'Rise From Ashes',
    stats: { matchesPlayed: 0, wins: 0, losses: 0, ties: 0, points: 0, nrr: 0 }
  },
  {
    name: 'Vaikartan Sena',
    shortName: 'VS',
    logo: '/images/teams/VS.png',
    primaryColor: '#800020',
    secondaryColor: '#FFD700',
    hostel: 'Hostel E',
    description: 'Named after Karna - the greatest warrior. Fighting against all odds with unmatched loyalty.',
    motto: 'Loyalty Above All',
    stats: { matchesPlayed: 0, wins: 0, losses: 0, ties: 0, points: 0, nrr: 0 }
  },
  {
    name: 'Chakravyuha Vidhvansak',
    shortName: 'CV',
    logo: '/images/teams/CV.png',
    primaryColor: '#2F2F2F',
    secondaryColor: '#FF6B35',
    hostel: 'Hostel F',
    description: 'Breakers of the unbreakable formation. They find a way when there seems none.',
    motto: 'Break Every Barrier',
    stats: { matchesPlayed: 0, wins: 0, losses: 0, ties: 0, points: 0, nrr: 0 }
  }
];

const seed = async () => {
  try {
    // Fix DNS SRV resolution issues
    dns.setServers(["1.1.1.1", "8.8.8.8"]);
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Create admin organizer
    const existingAdmin = await Organizer.findOne({ email: "admin@hpl.com" });
    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash("admin123", 10);
      await Organizer.create({
        email: "admin@hpl.com",
        passwordHash,
        name: "HPL Admin"
      });
      console.log("✅ Admin created: admin@hpl.com / admin123");
    } else {
      console.log("ℹ️  Admin already exists");
    }

    // Seed teams
    for (const teamData of teamsData) {
      const existingTeam = await Team.findOne({ name: teamData.name });
      if (!existingTeam) {
        await Team.create(teamData);
        console.log(`✅ Team created: ${teamData.name}`);
      } else {
        // Update existing team with new data
        await Team.findByIdAndUpdate(existingTeam._id, teamData);
        console.log(`ℹ️  Team updated: ${teamData.name}`);
      }
    }

    console.log("\n🏏 HPL 2026 Setup Complete!");
    console.log("   Login: admin@hpl.com / admin123");
    console.log("   Teams: 6 teams seeded\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding:", error);
    process.exit(1);
  }
};

seed();
