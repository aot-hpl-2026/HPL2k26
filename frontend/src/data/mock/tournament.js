// Mock Tournament Data for HPL 2026
// TODO: Replace with API call when backend is ready

export const tournament = {
  id: 'hpl-2026',
  name: 'Hostel Premier League',
  shortName: 'HPL',
  year: 2026,
  tagline: 'Where Legends Are Born',
  description: 'The ultimate cricket battleground for AOT College hostels. Six teams, one trophy, eternal glory.',
  logo: '/images/hpl-logo.png',
  venue: 'AOT College Cricket Ground',
  startDate: '2026-01-15',
  endDate: '2026-02-15',
  status: 'ongoing', // upcoming, ongoing, completed
  totalTeams: 6,
  totalMatches: 15,
  format: 'Round Robin + Playoffs',
  rules: {
    oversPerInning: 6,
    playersPerTeam: 11,
    powerplayOvers: 2,
  },
  sponsors: [
    { name: 'AOT College', type: 'title' },
  ],
  socialLinks: {
    instagram: '#',
    twitter: '#',
  }
}

export default tournament
