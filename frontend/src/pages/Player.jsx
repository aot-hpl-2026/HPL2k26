import { useQuery } from '@tanstack/react-query'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiArrowLeft } from 'react-icons/hi2'
import { playersApi, teamsApi } from '../services/api'
import { StatCard } from '../components/stats'
import { PerformanceChart } from '../components/charts'
import { LoadingSpinner, ErrorState, Badge } from '../components/common'
import { getAvatarUrl, formatRole } from '../utils'

const Player = () => {
  const { playerId } = useParams()

  const { data: playerData, isLoading, error } = useQuery({
    queryKey: ['player', playerId],
    queryFn: () => playersApi.getPlayerById(playerId),
    enabled: !!playerId,
  })

  const player = playerData?.data

  const { data: teamData } = useQuery({
    queryKey: ['team', player?.teamId],
    queryFn: () => teamsApi.getTeamById(player.teamId),
    enabled: !!player?.teamId,
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !player) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ErrorState message="Player not found" />
      </div>
    )
  }

  const team = teamData?.data

  const battingData = [
    { name: 'Runs', value: player?.stats?.batting?.runs ?? 0 },
    { name: 'Balls', value: player?.stats?.batting?.balls ?? 0 },
    { name: 'Fours', value: player?.stats?.batting?.fours ?? 0 },
    { name: 'Sixes', value: player?.stats?.batting?.sixes ?? 0 },
  ]

  return (
    <div className="min-h-screen bg-base-200">
      {/* Header */}
      <section 
        className="relative overflow-hidden py-12"
        style={{ backgroundColor: team?.primaryColor || '#8B1538' }}
      >
        <div className="container mx-auto px-4">
          <Link 
            to={team ? `/team/${team.id}` : '/teams'} 
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
          >
            <HiArrowLeft /> Back to {team?.name || 'Teams'}
          </Link>

          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Player Image */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative"
            >
              <img
                src={getAvatarUrl(player.name)}
                alt={player.name}
                className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-xl"
              />
              <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg">
                <span className="font-epic font-bold text-xl" style={{ color: team?.primaryColor }}>
                  {player.jerseyNumber}
                </span>
              </div>
            </motion.div>

            {/* Player Info */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-center md:text-left text-white"
            >
              <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
                <h1 className="text-3xl md:text-4xl font-epic font-bold">{player.name}</h1>
                {player.isCaptain && <Badge variant="secondary">Captain</Badge>}
              </div>
              <p className="text-white/80 text-lg mb-3">{team?.name}</p>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <span className={`badge badge-lg ${formatRole(player.role)}`}>{player.role}</span>
                <span className="badge badge-lg badge-outline text-white border-white/30">
                  {player.battingStyle}
                </span>
                {player.bowlingStyle !== 'None' && (
                  <span className="badge badge-lg badge-outline text-white border-white/30">
                    {player.bowlingStyle}
                  </span>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className="container mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 -mt-12 relative z-10 mb-8">
          <StatCard label="Matches" value={player?.stats?.matches ?? 0} color="accent" />
          <StatCard label="Runs" value={player?.stats?.batting?.runs ?? 0} color="primary" />
          <StatCard label="Wickets" value={player?.stats?.bowling?.wickets ?? 0} color="secondary" />
          <StatCard label="Catches" value={player?.stats?.fielding?.catches ?? 0} color="success" />
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Batting Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-base-100 rounded-xl border border-base-200 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-hpl-maroon to-hpl-navy px-4 py-3">
              <h3 className="text-white font-epic font-semibold">Batting Stats</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-base-200 rounded-lg">
                  <p className="text-3xl font-epic font-bold text-primary">{player?.stats?.batting?.runs ?? 0}</p>
                  <p className="text-sm text-base-content/60">Runs</p>
                </div>
                <div className="text-center p-4 bg-base-200 rounded-lg">
                  <p className="text-3xl font-epic font-bold text-secondary">{player?.stats?.batting?.highScore ?? 0}</p>
                  <p className="text-sm text-base-content/60">High Score</p>
                </div>
                <div className="text-center p-4 bg-base-200 rounded-lg">
                  <p className="text-3xl font-epic font-bold">{player?.stats?.batting?.average?.toFixed(1) ?? '-'}</p>
                  <p className="text-sm text-base-content/60">Average</p>
                </div>
                <div className="text-center p-4 bg-base-200 rounded-lg">
                  <p className="text-3xl font-epic font-bold">{player?.stats?.batting?.strikeRate?.toFixed(1) ?? '-'}</p>
                  <p className="text-sm text-base-content/60">Strike Rate</p>
                </div>
              </div>
              <div className="mt-4 flex justify-center gap-8 text-sm">
                <span><strong className="text-blue-500">{player?.stats?.batting?.fours ?? 0}</strong> Fours</span>
                <span><strong className="text-hpl-gold">{player?.stats?.batting?.sixes ?? 0}</strong> Sixes</span>
              </div>
            </div>
          </motion.div>

          {/* Bowling Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-base-100 rounded-xl border border-base-200 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-hpl-navy to-hpl-midnight px-4 py-3">
              <h3 className="text-white font-epic font-semibold">Bowling Stats</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-base-200 rounded-lg">
                  <p className="text-3xl font-epic font-bold text-primary">{player?.stats?.bowling?.wickets ?? 0}</p>
                  <p className="text-sm text-base-content/60">Wickets</p>
                </div>
                <div className="text-center p-4 bg-base-200 rounded-lg">
                  <p className="text-3xl font-epic font-bold text-secondary">{player?.stats?.bowling?.bestFigures ?? '-'}</p>
                  <p className="text-sm text-base-content/60">Best Figures</p>
                </div>
                <div className="text-center p-4 bg-base-200 rounded-lg">
                  <p className="text-3xl font-epic font-bold">{player?.stats?.bowling?.overs ?? 0}</p>
                  <p className="text-sm text-base-content/60">Overs</p>
                </div>
                <div className="text-center p-4 bg-base-200 rounded-lg">
                  <p className="text-3xl font-epic font-bold">{player?.stats?.bowling?.economy?.toFixed(1) ?? '-'}</p>
                  <p className="text-sm text-base-content/60">Economy</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Performance Chart */}
        <div className="mt-8">
          <PerformanceChart 
            data={battingData} 
            title="Batting Breakdown" 
          />
        </div>
      </div>
    </div>
  )
}

export default Player
