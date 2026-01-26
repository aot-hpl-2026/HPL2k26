import { motion, AnimatePresence } from 'framer-motion'
import Badge from '../common/Badge'
import { formatOvers, calculateRunRate } from '../../utils'

const LiveScoreCard = ({ match, score, recentBalls = [] }) => {
  if (!match) return null

  // Map teamA/teamB to team1/team2 for display consistency
  const team1 = match.team1 || match.teamA || {}
  const team2 = match.team2 || match.teamB || {}
  
  // Get current batting team based on innings data
  const currentInningsIdx = (match.currentInnings || 1) - 1
  const currentInnings = match.innings?.[currentInningsIdx]
  const battingTeamId = currentInnings?.battingTeam?.toString?.() || currentInnings?.battingTeam
  
  // Determine which team is batting
  const team1Batting = battingTeamId === (team1._id?.toString?.() || team1.id) || 
                       (currentInningsIdx === 0 && !battingTeamId)
  const team2Batting = battingTeamId === (team2._id?.toString?.() || team2.id) ||
                       (currentInningsIdx === 1 && !team1Batting)
  
  const displayScore = score || match?.score || { runs: 0, wickets: 0, overs: 0 }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-r from-hpl-maroon to-hpl-navy rounded-xl overflow-hidden shadow-xl"
    >
      {/* Header */}
      <div className="px-4 sm:px-6 py-2 sm:py-3 flex items-center justify-between bg-black/20">
        <span className="text-white/80 text-xs sm:text-sm font-medium">Match {match.matchNumber}</span>
        <Badge variant="live">LIVE</Badge>
      </div>

      {/* Score Display */}
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Team 1 */}
          <div className="flex-1 w-full sm:w-auto">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <div className="w-10 h-10 sm:w-14 sm:h-14 bg-white rounded-full flex items-center justify-center overflow-hidden p-1 flex-shrink-0">
                {team1.logo ? (
                  <img 
                    src={team1.logo} 
                    alt={team1.shortName || 'Team 1'}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <span className={`${team1.logo ? 'hidden' : 'flex'} text-hpl-maroon font-epic font-bold text-sm sm:text-lg items-center justify-center w-full h-full`}>
                  {team1.shortName || 'T1'}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-white text-sm sm:text-base font-medium truncate">{team1.name || 'Team 1'}</p>
                {team1Batting && (
                  <span className="text-hpl-gold text-xs">Batting</span>
                )}
              </div>
            </div>
            {team1Batting && displayScore && (
              <motion.div
                key={displayScore.runs}
                initial={{ scale: 1.1, backgroundColor: 'rgba(212, 175, 55, 0.5)' }}
                animate={{ scale: 1, backgroundColor: 'transparent' }}
                className="bg-white/5 rounded-lg p-2 sm:p-3 inline-block"
              >
                <span className="text-2xl sm:text-4xl font-bold text-white">
                  {displayScore.runs}<span className="text-lg sm:text-2xl text-white/60">/{displayScore.wickets}</span>
                </span>
                <span className="text-white/60 ml-2 text-xs sm:text-base">({formatOvers(displayScore.overs)} ov)</span>
              </motion.div>
            )}
          </div>

          {/* VS */}
          <div className="text-white/40 font-epic text-lg sm:text-xl">VS</div>

          {/* Team 2 */}
          <div className="flex-1 w-full sm:w-auto text-left sm:text-right">
            <div className="flex items-center sm:justify-end gap-2 sm:gap-3 mb-2">
              <div className="sm:hidden w-10 h-10 bg-white rounded-full flex items-center justify-center overflow-hidden p-1 flex-shrink-0">
                {team2.logo ? (
                  <img 
                    src={team2.logo} 
                    alt={team2.shortName || 'Team 2'}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <span className={`${team2.logo ? 'hidden' : 'flex'} text-hpl-navy font-epic font-bold text-sm items-center justify-center w-full h-full`}>
                  {team2.shortName || 'T2'}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-white text-sm sm:text-base font-medium truncate">{team2.name || 'Team 2'}</p>
                {team2Batting && (
                  <span className="text-hpl-gold text-xs">Batting</span>
                )}
              </div>
              <div className="hidden sm:flex w-14 h-14 bg-white rounded-full items-center justify-center overflow-hidden p-1 flex-shrink-0">
                {team2.logo ? (
                  <img 
                    src={team2.logo} 
                    alt={team2.shortName || 'Team 2'}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <span className={`${team2.logo ? 'hidden' : 'flex'} text-hpl-navy font-epic font-bold text-lg items-center justify-center w-full h-full`}>
                  {team2.shortName || 'T2'}
                </span>
              </div>
            </div>
            {team2Batting && displayScore && (
              <motion.div
                key={displayScore.runs}
                initial={{ scale: 1.1, backgroundColor: 'rgba(212, 175, 55, 0.5)' }}
                animate={{ scale: 1, backgroundColor: 'transparent' }}
                className="bg-white/5 rounded-lg p-2 sm:p-3 inline-block"
              >
                <span className="text-2xl sm:text-4xl font-bold text-white">
                  {displayScore.runs}<span className="text-lg sm:text-2xl text-white/60">/{displayScore.wickets}</span>
                </span>
                <span className="text-white/60 ml-2 text-xs sm:text-base">({formatOvers(displayScore.overs)} ov)</span>
              </motion.div>
            )}
            {!team2Batting && match.innings?.[0] && (
              <div className="bg-white/5 rounded-lg p-2 sm:p-3 inline-block">
                <span className="text-xl sm:text-2xl font-bold text-white/80">
                  {match.innings[0].runs}<span className="text-base sm:text-lg text-white/50">/{match.innings[0].wickets}</span>
                </span>
                <span className="text-white/50 ml-2 text-xs">({formatOvers(match.innings[0].overs)} ov)</span>
              </div>
            )}
            {!team2Batting && !match.innings?.[0] && (
              <p className="text-white/40 text-sm sm:text-base">Yet to bat</p>
            )}
          </div>
        </div>

        {/* Run Rate */}
        {displayScore && (
          <div className="mt-3 sm:mt-4 flex gap-4 sm:gap-6 text-xs sm:text-sm text-white/60">
            <span>CRR: <span className="text-white font-medium">{calculateRunRate(displayScore.runs, displayScore.overs)}</span></span>
          </div>
        )}
      </div>

      {/* Recent Balls */}
      {recentBalls.length > 0 && (
        <div className="px-4 sm:px-6 py-2 sm:py-3 bg-black/20">
          <p className="text-white/60 text-xs mb-2">Recent</p>
          <div className="flex gap-1.5 sm:gap-2 overflow-x-auto">
            <AnimatePresence mode="popLayout">
              {recentBalls.slice(-8).map((ball, i) => (
                <motion.span
                  key={i}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className={`
                    w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0
                    ${ball === 'W' ? 'bg-red-500 text-white' : ''}
                    ${ball === '4' ? 'bg-blue-500 text-white' : ''}
                    ${ball === '6' ? 'bg-hpl-gold text-hpl-dark' : ''}
                    ${ball === '0' ? 'bg-gray-600 text-white' : ''}
                    ${!['W', '4', '6', '0'].includes(ball) ? 'bg-white/20 text-white' : ''}
                  `}
                >
                  {ball}
                </motion.span>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default LiveScoreCard
