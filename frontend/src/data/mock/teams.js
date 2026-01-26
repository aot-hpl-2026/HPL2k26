// Mock Teams Data for HPL 2026
// TODO: Replace with API call when backend is ready

export const teams = [
  {
    id: 'narayani-sena',
    name: 'Narayani Sena',
    shortName: 'NS',
    logo: '/images/teams/NS.png',
    primaryColor: '#8B1538',
    secondaryColor: '#D4AF37',
    hostel: 'Hostel A',
    captain: 'player-1',
    description: 'The divine army, known for their strategic brilliance and unwavering spirit. They fight not just to win, but to inspire.',
    motto: 'Strength Through Unity',
    founded: 2024,
    stats: {
      matchesPlayed: 4,
      wins: 3,
      losses: 1,
      ties: 0,
      points: 6,
      nrr: 1.25,
    }
  },
  {
    id: 'kurukshetra-kings',
    name: 'Kurukshetra Kings',
    shortName: 'KK',
    logo: '/images/teams/KK.png',
    primaryColor: '#1B1F3B',
    secondaryColor: '#C0C0C0',
    hostel: 'Hostel B',
    captain: 'player-6',
    description: 'Masters of the battlefield, the Kings dominate with royal precision. Every match is their Kurukshetra.',
    motto: 'Conquer With Honor',
    founded: 2024,
    stats: {
      matchesPlayed: 4,
      wins: 3,
      losses: 1,
      ties: 0,
      points: 6,
      nrr: 0.95,
    }
  },
  {
    id: 'barbarika-xi',
    name: 'Barbarika XI',
    shortName: 'BXI',
    logo: '/images/teams/BB.png',
    primaryColor: '#4169E1',
    secondaryColor: '#FFD700',
    hostel: 'Hostel C',
    captain: 'player-11',
    description: 'Named after the legendary warrior who could end wars with three arrows. Swift, precise, deadly.',
    motto: 'Three Arrows, One Victory',
    founded: 2024,
    stats: {
      matchesPlayed: 4,
      wins: 2,
      losses: 2,
      ties: 0,
      points: 4,
      nrr: 0.35,
    }
  },
  {
    id: 'indraprastha-warriors',
    name: 'Indraprastha Warriors',
    shortName: 'IW',
    logo: '/images/teams/IP.png',
    primaryColor: '#CD7F32',
    secondaryColor: '#2F4F4F',
    hostel: 'Hostel D',
    captain: 'player-16',
    description: 'From the legendary city of the Pandavas. Warriors who turn every challenge into triumph.',
    motto: 'Rise From Ashes',
    founded: 2024,
    stats: {
      matchesPlayed: 4,
      wins: 2,
      losses: 2,
      ties: 0,
      points: 4,
      nrr: -0.15,
    }
  },
  {
    id: 'vaikartan-sena',
    name: 'Vaikartan Sena',
    shortName: 'VS',
    logo: '/images/teams/VS.png',
    primaryColor: '#800020',
    secondaryColor: '#FFD700',
    hostel: 'Hostel E',
    captain: 'player-21',
    description: 'Named after Karna - the greatest warrior. Fighting against all odds with unmatched loyalty.',
    motto: 'Loyalty Above All',
    founded: 2024,
    stats: {
      matchesPlayed: 4,
      wins: 1,
      losses: 3,
      ties: 0,
      points: 2,
      nrr: -0.85,
    }
  },
  {
    id: 'chakravyuha-vidhvansak',
    name: 'Chakravyuha Vidhvansak',
    shortName: 'CV',
    logo: '/images/teams/CV.png',
    primaryColor: '#2F2F2F',
    secondaryColor: '#FF6B35',
    hostel: 'Hostel F',
    captain: 'player-26',
    description: 'Breakers of the unbreakable formation. They find a way when there seems none.',
    motto: 'Break Every Barrier',
    founded: 2024,
    stats: {
      matchesPlayed: 4,
      wins: 1,
      losses: 3,
      ties: 0,
      points: 2,
      nrr: -1.55,
    }
  },
]

export const getTeamById = (id) => teams.find(team => team.id === id)

export const getPointsTable = () => {
  return [...teams].sort((a, b) => {
    if (b.stats.points !== a.stats.points) {
      return b.stats.points - a.stats.points
    }
    return b.stats.nrr - a.stats.nrr
  })
}

export default teams
