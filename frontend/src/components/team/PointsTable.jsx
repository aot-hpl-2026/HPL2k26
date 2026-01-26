import { motion } from 'framer-motion'
import { formatNRR } from '../../utils'

const PointsTable = ({ teams = [] }) => {
  if (!teams || teams.length === 0) {
    return (
      <div className="bg-base-100 rounded-xl border border-base-200 p-8 text-center">
        <p className="text-base-content/60">No teams data available</p>
      </div>
    )
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const item = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 }
  }

  return (
    <div className="bg-base-100 rounded-xl border border-base-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-hpl-maroon to-hpl-navy px-3 sm:px-4 py-2 sm:py-3">
        <h3 className="text-white font-epic font-semibold text-base sm:text-lg">Points Table</h3>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr className="text-base-content/60 border-b border-base-200">
              <th className="w-12">#</th>
              <th>Team</th>
              <th className="text-center">P</th>
              <th className="text-center">W</th>
              <th className="text-center">L</th>
              <th className="text-center">NRR</th>
              <th className="text-center">Pts</th>
            </tr>
          </thead>
          <motion.tbody variants={container} initial="hidden" animate="show">
            {teams.map((team, index) => (
              <motion.tr 
                key={team.id} 
                variants={item}
                className={`
                  hover:bg-base-200 transition-colors cursor-pointer
                  ${index < 4 ? 'border-l-4 border-l-success' : 'border-l-4 border-l-transparent'}
                `}
              >
                <td className="font-epic font-bold text-lg">
                  {index + 1}
                </td>
                <td>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div 
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center overflow-hidden bg-base-200 flex-shrink-0"
                    >
                      {team.logo ? (
                        <img 
                          src={team.logo} 
                          alt={team.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <span 
                        className="font-epic font-bold text-sm items-center justify-center w-full h-full"
                        style={{ color: team.primaryColor, display: team.logo ? 'none' : 'flex' }}
                      >
                        {team.shortName}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm sm:text-base text-base-content truncate">{team.name}</p>
                      <p className="text-[10px] sm:text-xs text-base-content/50 hidden sm:block">{team.hostel}</p>
                    </div>
                  </div>
                </td>
                <td className="text-center">{team?.stats?.matchesPlayed ?? 0}</td>
                <td className="text-center font-semibold text-success">{team?.stats?.wins ?? 0}</td>
                <td className="text-center text-error">{team?.stats?.losses ?? 0}</td>
                <td className={`text-center font-medium ${(team?.stats?.nrr ?? 0) >= 0 ? 'text-success' : 'text-error'}`}>
                  {formatNRR(team?.stats?.nrr ?? 0)}
                </td>
                <td className="text-center">
                  <span className="font-epic font-bold text-lg text-primary">{team?.stats?.points ?? 0}</span>
                </td>
              </motion.tr>
            ))}
          </motion.tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="px-4 py-3 bg-base-200 flex items-center gap-4 text-xs text-base-content/60">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-success rounded" />
          <span>Qualifies for Playoffs</span>
        </div>
      </div>
    </div>
  )
}

export default PointsTable
