import { useQuery } from '@tanstack/react-query'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiArrowLeft, HiUserGroup, HiTrophy, HiChartBar } from 'react-icons/hi2'
import { teamsApi, playersApi, matchesApi } from '../services/api'
import { PlayerCard } from '../components/player'
import { MatchCard } from '../components/match'
import { StatCard } from '../components/stats'
import { DonutChart } from '../components/charts'
import { LoadingSpinner, ErrorState, SectionHeader, SkeletonCard } from '../components/common'

const Team = () => {
  const { teamId } = useParams()

  // Fetch team data
  const { data: teamData, isLoading, error } = useQuery({
    queryKey: ['team', teamId],
    queryFn: () => teamsApi.getTeamById(teamId),
    enabled: !!teamId,
  })

  // Fetch team players
  const { data: playersData } = useQuery({
    queryKey: ['players', teamId],
    queryFn: () => playersApi.getPlayersByTeam(teamId),
    enabled: !!teamId,
  })

  // Fetch team matches
  const { data: matchesData } = useQuery({
    queryKey: ['matches', 'team', teamId],
    queryFn: () => matchesApi.getMatchesByTeam(teamId),
    enabled: !!teamId,
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !teamData?.data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ErrorState message="Team not found" />
      </div>
    )
  }

  const team = teamData.data
  const players = playersData?.data || []
  const matches = matchesData?.data || []

  const winLossData = [
    { name: 'Wins', value: team?.stats?.wins ?? 0 },
    { name: 'Losses', value: team?.stats?.losses ?? 0 },
    { name: 'Ties', value: team?.stats?.ties ?? 0 },
  ]

  return (
    <div className="min-h-screen">
      {/* Team Header */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative overflow-hidden"
        style={{ backgroundColor: team?.primaryColor || '#8B1538' }}
      >
        {/* Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="container mx-auto px-4 py-12 relative">
          {/* Back Button */}
          <Link 
            to="/teams" 
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
          >
            <HiArrowLeft /> Back to Teams
          </Link>

          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Team Logo */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-32 h-32 md:w-40 md:h-40 bg-white rounded-2xl flex items-center justify-center shadow-xl overflow-hidden p-2"
            >
              <img 
                src={team?.logo || '/images/teams/default.png'} 
                alt={`${team?.name || 'Team'} logo`}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <span 
                className="font-epic font-bold text-4xl md:text-5xl hidden items-center justify-center w-full h-full"
                style={{ color: team?.primaryColor || '#8B1538' }}
              >
                {team?.shortName || 'TM'}
              </span>
            </motion.div>

            {/* Team Info */}
            <div className="text-center md:text-left text-white">
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-3xl md:text-5xl font-epic font-bold mb-2"
              >
                {team?.name || 'Unknown Team'}
              </motion.h1>
              <p className="text-white/80 text-lg mb-2">{team?.hostel || ''}</p>
              <p className="text-xl font-epic" style={{ color: team?.secondaryColor || '#FFD700' }}>
                "{team?.motto || ''}"
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 -mt-12 relative z-10">
          <StatCard label="Matches" value={team?.stats?.matchesPlayed ?? 0} icon={HiChartBar} color="accent" />
          <StatCard label="Wins" value={team?.stats?.wins ?? 0} icon={HiTrophy} color="success" />
          <StatCard label="Points" value={team?.stats?.points ?? 0} color="secondary" />
          <StatCard label="NRR" value={team?.stats?.nrr ?? 0} suffix="" animate={false} color="primary" />
        </div>

        {/* Team Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-base-100 rounded-xl border border-base-200 p-6 mb-8"
        >
          <h2 className="font-epic font-bold text-xl mb-4">About the Team</h2>
          <p className="text-base-content/70 leading-relaxed">{team?.description || 'No description available.'}</p>
        </motion.div>

        {/* Squad */}
        <section className="mb-12">
          <SectionHeader 
            title="Squad" 
            subtitle={`${players.length} players`}
            icon={HiUserGroup}
          />
          
          {players.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {players.map((player, index) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <PlayerCard player={player} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-base-200 rounded-xl p-8 text-center">
              <p className="text-base-content/60">No players added yet</p>
            </div>
          )}
        </section>

        {/* Team Performance & Matches */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Win/Loss Chart */}
          <DonutChart data={winLossData} title="Win/Loss Record" />

          {/* Recent Matches */}
          <div>
            <SectionHeader title="Recent Matches" />
            <div className="space-y-4">
              {matches.slice(0, 3).map((match) => (
                <MatchCard key={match.id} match={match} showDetails={false} />
              ))}
              {matches.length === 0 && (
                <div className="bg-base-200 rounded-xl p-8 text-center">
                  <p className="text-base-content/60">No matches played yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Team
