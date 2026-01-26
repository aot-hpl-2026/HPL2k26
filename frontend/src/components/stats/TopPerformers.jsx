import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { getAvatarUrl } from '../../utils'

const TopPerformers = ({ title, players, statKey, statLabel }) => {
  // Helper to get stat value - handles both nested (stats.batting.runs) and flat (runs) structures
  const getStatValue = (player, key) => {
    // First try the key path (for nested structures like stats.batting.runs)
    const nestedValue = key.split('.').reduce((obj, k) => obj?.[k], player)
    if (nestedValue !== undefined) return nestedValue
    
    // Fall back to the last part of the key (for flat structures)
    const lastKey = key.split('.').pop()
    return player[lastKey] ?? 0
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-base-100 rounded-xl border border-base-200 overflow-hidden"
    >
      <div className="bg-gradient-to-r from-hpl-maroon to-hpl-navy px-4 py-3">
        <h3 className="text-white font-epic font-semibold">{title}</h3>
      </div>

      <div className="divide-y divide-base-200">
        {players.map((player, index) => {
          const statValue = getStatValue(player, statKey)
          // Handle both teamId (old format) and team (new format)
          const teamName = player.team || player.teamId || 'Unknown'
          
          return (
            <Link
              key={player.id || player._id || index}
              to={`/player/${player.id || player._id}`}
              className="flex items-center gap-4 p-4 hover:bg-base-200 transition-colors"
            >
              {/* Rank */}
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center font-epic font-bold
                ${index === 0 ? 'bg-hpl-gold text-hpl-dark' : ''}
                ${index === 1 ? 'bg-gray-300 text-gray-700' : ''}
                ${index === 2 ? 'bg-amber-600 text-white' : ''}
                ${index > 2 ? 'bg-base-200 text-base-content' : ''}
              `}>
                {player.rank || index + 1}
              </div>

              {/* Player Info */}
              <div className="flex items-center gap-3 flex-1">
                <img
                  src={getAvatarUrl(player.name)}
                  alt={player.name || 'Player'}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium text-base-content">{player.name || 'Unknown'}</p>
                  <p className="text-xs text-base-content/50">
                    {typeof teamName === 'string' ? teamName.replace(/-/g, ' ') : teamName}
                  </p>
                </div>
              </div>

              {/* Stat */}
              <div className="text-right">
                <p className="text-2xl font-epic font-bold text-primary">{statValue}</p>
                <p className="text-xs text-base-content/50">{statLabel}</p>
              </div>
            </Link>
          )
        })}
      </div>
    </motion.div>
  )
}

export default TopPerformers
