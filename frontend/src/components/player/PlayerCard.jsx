import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Badge from '../common/Badge'
import { formatRole, getAvatarUrl } from '../../utils'

const PlayerCard = ({ player, showTeam = false }) => {
  if (!player) return null
  
  return (
    <Link to={`/player/${player?.id || player?._id}`}>
      <motion.div
        whileHover={{ y: -4 }}
        className="bg-base-100 rounded-xl border border-base-200 overflow-hidden group"
      >
        {/* Image */}
        <div className="relative h-48 bg-gradient-to-br from-base-200 to-base-300 overflow-hidden">
          <img
            src={player.imageUrl || getAvatarUrl(player.name)}
            alt={player.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {player.isCaptain && (
            <div className="absolute top-3 right-3">
              <Badge variant="secondary" size="sm">Captain</Badge>
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-3 left-3">
            <span className="font-epic font-bold text-3xl text-white opacity-80">
              #{player.jerseyNumber}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-semibold text-lg text-base-content group-hover:text-primary transition-colors">
            {player.name}
          </h3>
          <div className="flex items-center gap-2 mt-2">
            <span className={`badge badge-sm ${formatRole(player.role)}`}>
              {player.role}
            </span>
          </div>

          {/* Quick Stats */}
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            <div className="text-base-content/60">
              <span className="font-semibold text-base-content">{player?.stats?.batting?.runs ?? 0}</span> runs
            </div>
            <div className="text-base-content/60">
              <span className="font-semibold text-base-content">{player?.stats?.bowling?.wickets ?? 0}</span> wickets
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  )
}

export default PlayerCard
