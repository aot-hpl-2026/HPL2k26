import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiCalendar, HiMapPin } from 'react-icons/hi2'
import Badge from '../common/Badge'
import { formatDate, formatTime, formatOvers, calculateRunRate } from '../../utils'

const MatchCard = ({ match, showDetails = true }) => {
  if (!match) return null
  
  const isLive = match.status === 'live'
  const isCompleted = match.status === 'completed'
  
  // Safely get team data with fallbacks
  const team1 = match.team1 || match.teamA || {}
  const team2 = match.team2 || match.teamB || {}
  const matchId = match.id || match._id

  return (
    <Link to={`/match/${matchId}`}>
      <motion.div
        whileHover={{ y: -4 }}
        className={`
          bg-base-100 rounded-xl border overflow-hidden transition-shadow
          ${isLive ? 'border-red-500 shadow-lg shadow-red-500/20' : 'border-base-200 hover:shadow-epic'}
        `}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-hpl-navy to-hpl-midnight px-4 py-2 flex items-center justify-between">
          <span className="text-white/80 text-sm">Match {match.matchNumber || '#'}</span>
          {isLive && <Badge variant="live">LIVE</Badge>}
          {match.status === 'upcoming' && <Badge variant="secondary">Upcoming</Badge>}
          {match.status === 'scheduled' && <Badge variant="secondary">Scheduled</Badge>}
          {isCompleted && <Badge variant="accent">Completed</Badge>}
        </div>

        {/* Teams */}
        <div className="p-3 sm:p-4">
          {/* Team 1 */}
          <div className={`flex items-center justify-between py-2 sm:py-3 ${team1.batting && isLive ? 'font-semibold' : ''}`}>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white border border-base-200 rounded-lg flex items-center justify-center overflow-hidden p-1">
                {team1.logo || team1.logoUrl ? (
                  <img 
                    src={team1.logo || team1.logoUrl} 
                    alt={team1.shortName || team1.name || 'Team'}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling && (e.target.nextSibling.style.display = 'flex');
                    }}
                  />
                ) : null}
                <span className={`${team1.logo || team1.logoUrl ? 'hidden' : 'flex'} text-hpl-maroon font-epic font-bold text-sm items-center justify-center w-full h-full`}>
                  {team1.shortName || (team1.name ? team1.name.substring(0, 3).toUpperCase() : 'TBA')}
                </span>
              </div>
              <div>
                <p className="font-medium text-sm sm:text-base text-base-content line-clamp-1">{team1.name || 'Team A'}</p>
                {team1.batting && isLive && (
                  <span className="text-xs text-hpl-gold">Batting</span>
                )}
              </div>
            </div>
            {team1.score && (
              <div className="text-right">
                <p className="text-lg sm:text-xl font-bold text-base-content">
                  {team1.score.runs || 0}/{team1.score.wickets || 0}
                </p>
                <p className="text-sm text-base-content/60">
                  ({formatOvers(team1.score.overs || 0)} ov)
                </p>
              </div>
            )}
          </div>

          <div className="divider my-0 text-xs text-base-content/40">VS</div>

          {/* Team 2 */}
          <div className={`flex items-center justify-between py-2 sm:py-3 ${team2.batting && isLive ? 'font-semibold' : ''}`}>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white border border-base-200 rounded-lg flex items-center justify-center overflow-hidden p-1">
                {team2.logo || team2.logoUrl ? (
                  <img 
                    src={team2.logo || team2.logoUrl} 
                    alt={team2.shortName || team2.name || 'Team'}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling && (e.target.nextSibling.style.display = 'flex');
                    }}
                  />
                ) : null}
                <span className={`${team2.logo || team2.logoUrl ? 'hidden' : 'flex'} text-hpl-maroon font-epic font-bold text-sm items-center justify-center w-full h-full`}>
                  {team2.shortName || (team2.name ? team2.name.substring(0, 3).toUpperCase() : 'TBA')}
                </span>
              </div>
              <div>
                <p className="font-medium text-sm sm:text-base text-base-content line-clamp-1">{team2.name || 'Team B'}</p>
                {team2.batting && isLive && (
                  <span className="text-xs text-hpl-gold">Batting</span>
                )}
              </div>
            </div>
            {team2.score && (
              <div className="text-right">
                <p className="text-lg sm:text-xl font-bold text-base-content">
                  {team2.score.runs || 0}/{team2.score.wickets || 0}
                </p>
                <p className="text-sm text-base-content/60">
                  ({formatOvers(team2.score.overs || 0)} ov)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        {showDetails && (
          <div className="bg-base-200 px-3 sm:px-4 py-2 sm:py-3 flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-base-content/60">
            <div className="flex items-center gap-1">
              <HiCalendar className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>{formatDate(match.date || match.scheduledAt)}, {formatTime(match.time || match.scheduledAt)}</span>
            </div>
            {(match.venue || match.location) && (
              <div className="flex items-center gap-1">
                <HiMapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="line-clamp-1">{match.venue || match.location}</span>
              </div>
            )}
          </div>
        )}

        {/* Result */}
        {isCompleted && match.result && (
          <div className="bg-hpl-gold/10 px-4 py-2 text-center">
            <p className="text-sm font-medium text-hpl-maroon">
              {typeof match.result === 'string' 
                ? match.result 
                : (match.result.winner === (team1.id || team1._id) ? team1.name : team2.name) + ' won by ' + match.result.margin
              }
            </p>
          </div>
        )}
        
        {/* Action Button */}
        {isCompleted && (
          <div className="bg-base-200 px-4 py-2 text-center border-t border-base-300">
            <span className="text-sm font-medium text-primary">📊 View Scorecard</span>
          </div>
        )}
        {isLive && (
          <div className="bg-red-500/10 px-4 py-2 text-center border-t border-red-500/20">
            <span className="text-sm font-medium text-red-600">🔴 Watch Live</span>
          </div>
        )}
      </motion.div>
    </Link>
  )
}

export default MatchCard
