// Mock Matches Data for HPL 2026
// TODO: Replace with API call when backend is ready

export const matches = [
  // Live Match
  {
    id: 'match-1',
    status: 'live',
    matchNumber: 8,
    date: '2026-01-25',
    time: '14:00',
    venue: 'AOT College Ground',
    team1: {
      id: 'narayani-sena',
      name: 'Narayani Sena',
      shortName: 'NS',
      logo: '/images/teams/NS.png',
      score: {
        runs: 87,
        wickets: 3,
        overs: 4.2,
      },
      batting: true,
    },
    team2: {
      id: 'kurukshetra-kings',
      name: 'Kurukshetra Kings',
      shortName: 'KK',
      logo: '/images/teams/KK.png',
      score: null,
      batting: false,
    },
    toss: {
      winner: 'narayani-sena',
      decision: 'bat',
    },
    currentBatsmen: [
      { name: 'Arjun Sharma', runs: 42, balls: 28, fours: 5, sixes: 2, onStrike: true },
      { name: 'Vikram Patel', runs: 18, balls: 14, fours: 2, sixes: 0, onStrike: false },
    ],
    currentBowler: { name: 'Deepak Yadav', overs: 1.2, runs: 18, wickets: 1, economy: 13.5 },
    recentBalls: ['1', '4', 'W', '0', '2', '6', '1', '4'],
    result: null,
  },
  
  // Upcoming Matches
  {
    id: 'match-2',
    status: 'upcoming',
    matchNumber: 9,
    date: '2026-01-26',
    time: '10:00',
    venue: 'AOT College Ground',
    team1: {
      id: 'barbarika-xi',
      name: 'Barbarika XI',
      shortName: 'BX',
      logo: '/images/teams/BB.png',
      score: null,
      batting: false,
    },
    team2: {
      id: 'indraprastha-warriors',
      name: 'Indraprastha Warriors',
      shortName: 'IW',
      logo: '/images/teams/IP.png',
      score: null,
      batting: false,
    },
    toss: null,
    result: null,
  },
  {
    id: 'match-3',
    status: 'upcoming',
    matchNumber: 10,
    date: '2026-01-26',
    time: '14:00',
    venue: 'AOT College Ground',
    team1: {
      id: 'vaikartan-sena',
      name: 'Vaikartan Sena',
      shortName: 'VS',
      logo: '/images/teams/VS.png',
      score: null,
      batting: false,
    },
    team2: {
      id: 'chakravyuha-vidhvansak',
      name: 'Chakravyuha Vidhvansak',
      shortName: 'CV',
      logo: '/images/teams/CV.png',
      score: null,
      batting: false,
    },
    toss: null,
    result: null,
  },

  // Completed Matches
  {
    id: 'match-4',
    status: 'completed',
    matchNumber: 7,
    date: '2026-01-24',
    time: '14:00',
    venue: 'AOT College Ground',
    team1: {
      id: 'kurukshetra-kings',
      name: 'Kurukshetra Kings',
      shortName: 'KK',
      logo: '/images/teams/KK.png',
      score: { runs: 98, wickets: 4, overs: 6 },
      batting: true,
    },
    team2: {
      id: 'barbarika-xi',
      name: 'Barbarika XI',
      shortName: 'BX',
      logo: '/images/teams/BB.png',
      score: { runs: 92, wickets: 6, overs: 6 },
      batting: false,
    },
    toss: { winner: 'kurukshetra-kings', decision: 'bat' },
    result: {
      winner: 'kurukshetra-kings',
      margin: '6 runs',
      playerOfMatch: 'player-6',
    },
  },
  {
    id: 'match-5',
    status: 'completed',
    matchNumber: 6,
    date: '2026-01-23',
    time: '14:00',
    venue: 'AOT College Ground',
    team1: {
      id: 'narayani-sena',
      name: 'Narayani Sena',
      shortName: 'NS',
      logo: '/images/teams/NS.png',
      score: { runs: 112, wickets: 3, overs: 6 },
      batting: true,
    },
    team2: {
      id: 'vaikartan-sena',
      name: 'Vaikartan Sena',
      shortName: 'VS',
      logo: '/images/teams/VS.png',
      score: { runs: 86, wickets: 8, overs: 6 },
      batting: false,
    },
    toss: { winner: 'narayani-sena', decision: 'bat' },
    result: {
      winner: 'narayani-sena',
      margin: '26 runs',
      playerOfMatch: 'player-1',
    },
  },
  {
    id: 'match-6',
    status: 'completed',
    matchNumber: 5,
    date: '2026-01-22',
    time: '10:00',
    venue: 'AOT College Ground',
    team1: {
      id: 'indraprastha-warriors',
      name: 'Indraprastha Warriors',
      shortName: 'IW',
      logo: '/images/teams/IP.png',
      score: { runs: 78, wickets: 5, overs: 6 },
      batting: false,
    },
    team2: {
      id: 'chakravyuha-vidhvansak',
      name: 'Chakravyuha Vidhvansak',
      shortName: 'CV',
      logo: '/images/teams/CV.png',
      score: { runs: 74, wickets: 7, overs: 6 },
      batting: true,
    },
    toss: { winner: 'chakravyuha-vidhvansak', decision: 'bat' },
    result: {
      winner: 'indraprastha-warriors',
      margin: '4 runs',
      playerOfMatch: 'player-16',
    },
  },
]

export const getMatchById = (id) => matches.find(m => m.id === id)
export const getLiveMatches = () => matches.filter(m => m.status === 'live')
export const getUpcomingMatches = () => matches.filter(m => m.status === 'upcoming')
export const getCompletedMatches = () => matches.filter(m => m.status === 'completed')
export const getMatchesByTeam = (teamId) => matches.filter(m => 
  m.team1.id === teamId || m.team2.id === teamId
)

export default matches
