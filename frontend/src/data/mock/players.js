// Mock Players Data for HPL 2026
// TODO: Replace with API call when backend is ready

export const players = [
  // Narayani Sena Players
  {
    id: 'player-1',
    name: 'Arjun Sharma',
    teamId: 'narayani-sena',
    role: 'Batsman',
    battingStyle: 'Right-hand bat',
    bowlingStyle: 'Right-arm medium',
    image: '/images/players/default.png',
    jerseyNumber: 7,
    isCaptain: true,
    stats: {
      matches: 4,
      batting: { runs: 156, balls: 98, fours: 18, sixes: 6, highScore: 52, average: 39.0, strikeRate: 159.18 },
      bowling: { overs: 4, wickets: 1, runs: 32, economy: 8.0, bestFigures: '1/12' },
      fielding: { catches: 3, runouts: 1 }
    }
  },
  {
    id: 'player-2',
    name: 'Vikram Patel',
    teamId: 'narayani-sena',
    role: 'All-rounder',
    battingStyle: 'Left-hand bat',
    bowlingStyle: 'Left-arm spin',
    image: '/images/players/default.png',
    jerseyNumber: 23,
    isCaptain: false,
    stats: {
      matches: 4,
      batting: { runs: 89, balls: 62, fours: 8, sixes: 4, highScore: 34, average: 22.25, strikeRate: 143.55 },
      bowling: { overs: 12, wickets: 6, runs: 78, economy: 6.5, bestFigures: '3/18' },
      fielding: { catches: 2, runouts: 0 }
    }
  },
  {
    id: 'player-3',
    name: 'Rahul Singh',
    teamId: 'narayani-sena',
    role: 'Bowler',
    battingStyle: 'Right-hand bat',
    bowlingStyle: 'Right-arm fast',
    image: '/images/players/default.png',
    jerseyNumber: 11,
    isCaptain: false,
    stats: {
      matches: 4,
      batting: { runs: 23, balls: 18, fours: 2, sixes: 1, highScore: 15, average: 7.67, strikeRate: 127.78 },
      bowling: { overs: 16, wickets: 9, runs: 92, economy: 5.75, bestFigures: '4/22' },
      fielding: { catches: 1, runouts: 0 }
    }
  },
  {
    id: 'player-4',
    name: 'Aditya Kumar',
    teamId: 'narayani-sena',
    role: 'Wicket-keeper',
    battingStyle: 'Right-hand bat',
    bowlingStyle: 'None',
    image: '/images/players/default.png',
    jerseyNumber: 17,
    isCaptain: false,
    stats: {
      matches: 4,
      batting: { runs: 78, balls: 56, fours: 6, sixes: 3, highScore: 28, average: 19.5, strikeRate: 139.29 },
      bowling: { overs: 0, wickets: 0, runs: 0, economy: 0, bestFigures: '-' },
      fielding: { catches: 6, runouts: 2, stumpings: 2 }
    }
  },
  {
    id: 'player-5',
    name: 'Mohit Verma',
    teamId: 'narayani-sena',
    role: 'Batsman',
    battingStyle: 'Right-hand bat',
    bowlingStyle: 'Right-arm off-spin',
    image: '/images/players/default.png',
    jerseyNumber: 45,
    isCaptain: false,
    stats: {
      matches: 4,
      batting: { runs: 102, balls: 78, fours: 10, sixes: 4, highScore: 41, average: 25.5, strikeRate: 130.77 },
      bowling: { overs: 2, wickets: 0, runs: 18, economy: 9.0, bestFigures: '0/18' },
      fielding: { catches: 2, runouts: 1 }
    }
  },

  // Kurukshetra Kings Players
  {
    id: 'player-6',
    name: 'Karan Malhotra',
    teamId: 'kurukshetra-kings',
    role: 'All-rounder',
    battingStyle: 'Right-hand bat',
    bowlingStyle: 'Right-arm medium fast',
    image: '/images/players/default.png',
    jerseyNumber: 10,
    isCaptain: true,
    stats: {
      matches: 4,
      batting: { runs: 134, balls: 88, fours: 14, sixes: 5, highScore: 48, average: 33.5, strikeRate: 152.27 },
      bowling: { overs: 14, wickets: 7, runs: 88, economy: 6.29, bestFigures: '3/20' },
      fielding: { catches: 4, runouts: 1 }
    }
  },
  {
    id: 'player-7',
    name: 'Sanjay Gupta',
    teamId: 'kurukshetra-kings',
    role: 'Batsman',
    battingStyle: 'Left-hand bat',
    bowlingStyle: 'None',
    image: '/images/players/default.png',
    jerseyNumber: 18,
    isCaptain: false,
    stats: {
      matches: 4,
      batting: { runs: 112, balls: 76, fours: 12, sixes: 4, highScore: 45, average: 28.0, strikeRate: 147.37 },
      bowling: { overs: 0, wickets: 0, runs: 0, economy: 0, bestFigures: '-' },
      fielding: { catches: 3, runouts: 0 }
    }
  },
  {
    id: 'player-8',
    name: 'Deepak Yadav',
    teamId: 'kurukshetra-kings',
    role: 'Bowler',
    battingStyle: 'Right-hand bat',
    bowlingStyle: 'Left-arm fast',
    image: '/images/players/default.png',
    jerseyNumber: 33,
    isCaptain: false,
    stats: {
      matches: 4,
      batting: { runs: 18, balls: 14, fours: 2, sixes: 0, highScore: 12, average: 6.0, strikeRate: 128.57 },
      bowling: { overs: 18, wickets: 11, runs: 98, economy: 5.44, bestFigures: '4/18' },
      fielding: { catches: 2, runouts: 0 }
    }
  },

  // Barbarika XI Players
  {
    id: 'player-11',
    name: 'Pranav Joshi',
    teamId: 'barbarika-xi',
    role: 'Batsman',
    battingStyle: 'Right-hand bat',
    bowlingStyle: 'Right-arm leg-spin',
    image: '/images/players/default.png',
    jerseyNumber: 3,
    isCaptain: true,
    stats: {
      matches: 4,
      batting: { runs: 145, balls: 102, fours: 15, sixes: 5, highScore: 56, average: 36.25, strikeRate: 142.16 },
      bowling: { overs: 6, wickets: 2, runs: 42, economy: 7.0, bestFigures: '2/14' },
      fielding: { catches: 5, runouts: 2 }
    }
  },
  {
    id: 'player-12',
    name: 'Nikhil Sharma',
    teamId: 'barbarika-xi',
    role: 'Bowler',
    battingStyle: 'Left-hand bat',
    bowlingStyle: 'Right-arm fast',
    image: '/images/players/default.png',
    jerseyNumber: 22,
    isCaptain: false,
    stats: {
      matches: 4,
      batting: { runs: 34, balls: 28, fours: 3, sixes: 1, highScore: 18, average: 8.5, strikeRate: 121.43 },
      bowling: { overs: 20, wickets: 12, runs: 102, economy: 5.1, bestFigures: '5/24' },
      fielding: { catches: 1, runouts: 0 }
    }
  },

  // Indraprastha Warriors Players
  {
    id: 'player-16',
    name: 'Ravi Tiwari',
    teamId: 'indraprastha-warriors',
    role: 'All-rounder',
    battingStyle: 'Right-hand bat',
    bowlingStyle: 'Right-arm medium',
    image: '/images/players/default.png',
    jerseyNumber: 9,
    isCaptain: true,
    stats: {
      matches: 4,
      batting: { runs: 98, balls: 72, fours: 9, sixes: 3, highScore: 38, average: 24.5, strikeRate: 136.11 },
      bowling: { overs: 10, wickets: 5, runs: 68, economy: 6.8, bestFigures: '2/15' },
      fielding: { catches: 3, runouts: 1 }
    }
  },
  {
    id: 'player-17',
    name: 'Amit Chauhan',
    teamId: 'indraprastha-warriors',
    role: 'Batsman',
    battingStyle: 'Left-hand bat',
    bowlingStyle: 'Left-arm spin',
    image: '/images/players/default.png',
    jerseyNumber: 14,
    isCaptain: false,
    stats: {
      matches: 4,
      batting: { runs: 122, balls: 88, fours: 13, sixes: 4, highScore: 44, average: 30.5, strikeRate: 138.64 },
      bowling: { overs: 4, wickets: 1, runs: 28, economy: 7.0, bestFigures: '1/10' },
      fielding: { catches: 2, runouts: 0 }
    }
  },

  // Vaikartan Sena Players
  {
    id: 'player-21',
    name: 'Suresh Nair',
    teamId: 'vaikartan-sena',
    role: 'Batsman',
    battingStyle: 'Right-hand bat',
    bowlingStyle: 'Right-arm off-spin',
    image: '/images/players/default.png',
    jerseyNumber: 5,
    isCaptain: true,
    stats: {
      matches: 4,
      batting: { runs: 88, balls: 68, fours: 8, sixes: 2, highScore: 32, average: 22.0, strikeRate: 129.41 },
      bowling: { overs: 8, wickets: 3, runs: 52, economy: 6.5, bestFigures: '2/16' },
      fielding: { catches: 4, runouts: 1 }
    }
  },
  {
    id: 'player-22',
    name: 'Prakash Mehta',
    teamId: 'vaikartan-sena',
    role: 'Bowler',
    battingStyle: 'Right-hand bat',
    bowlingStyle: 'Right-arm fast',
    image: '/images/players/default.png',
    jerseyNumber: 31,
    isCaptain: false,
    stats: {
      matches: 4,
      batting: { runs: 22, balls: 18, fours: 2, sixes: 0, highScore: 14, average: 5.5, strikeRate: 122.22 },
      bowling: { overs: 16, wickets: 8, runs: 96, economy: 6.0, bestFigures: '3/22' },
      fielding: { catches: 2, runouts: 0 }
    }
  },

  // Chakravyuha Vidhvansak Players
  {
    id: 'player-26',
    name: 'Ajay Reddy',
    teamId: 'chakravyuha-vidhvansak',
    role: 'All-rounder',
    battingStyle: 'Left-hand bat',
    bowlingStyle: 'Left-arm medium fast',
    image: '/images/players/default.png',
    jerseyNumber: 8,
    isCaptain: true,
    stats: {
      matches: 4,
      batting: { runs: 76, balls: 58, fours: 7, sixes: 2, highScore: 28, average: 19.0, strikeRate: 131.03 },
      bowling: { overs: 12, wickets: 4, runs: 82, economy: 6.83, bestFigures: '2/18' },
      fielding: { catches: 3, runouts: 2 }
    }
  },
  {
    id: 'player-27',
    name: 'Vivek Iyer',
    teamId: 'chakravyuha-vidhvansak',
    role: 'Wicket-keeper',
    battingStyle: 'Right-hand bat',
    bowlingStyle: 'None',
    image: '/images/players/default.png',
    jerseyNumber: 21,
    isCaptain: false,
    stats: {
      matches: 4,
      batting: { runs: 68, balls: 52, fours: 6, sixes: 2, highScore: 24, average: 17.0, strikeRate: 130.77 },
      bowling: { overs: 0, wickets: 0, runs: 0, economy: 0, bestFigures: '-' },
      fielding: { catches: 5, runouts: 1, stumpings: 3 }
    }
  },
]

export const getPlayerById = (id) => players.find(p => p.id === id)
export const getPlayersByTeam = (teamId) => players.filter(p => p.teamId === teamId)
export const getTopBatsmen = (limit = 5) => {
  return [...players]
    .sort((a, b) => b.stats.batting.runs - a.stats.batting.runs)
    .slice(0, limit)
}
export const getTopBowlers = (limit = 5) => {
  return [...players]
    .sort((a, b) => b.stats.bowling.wickets - a.stats.bowling.wickets)
    .slice(0, limit)
}

export default players
