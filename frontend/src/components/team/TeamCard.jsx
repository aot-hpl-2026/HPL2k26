import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiUserGroup, HiTrophy } from 'react-icons/hi2'

const TeamCard = ({ team, rank = null }) => {
  const teamId = team.id || team._id
  return (
    <Link to={`/team/${teamId}`}>
      <motion.div
        whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(139, 21, 56, 0.15)' }}
        className="bg-base-100 rounded-xl border border-base-200 overflow-visible group"
      >
        {/* Header with Team Color */}
        <div 
          className="h-24 relative overflow-hidden rounded-t-xl"
          style={{ backgroundColor: team.primaryColor }}
        >
          {/* Pattern Overlay */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
          
          {/* Rank Badge */}
          {rank && (
            <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-white flex items-center justify-center z-10">
              <span className="font-epic font-bold text-hpl-maroon">{rank}</span>
            </div>
          )}
        </div>

        {/* Team Logo - Positioned to overlap header and content */}
        <div className="relative">
          <div className="absolute -top-12 sm:-top-14 left-1/2 -translate-x-1/2 w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-xl sm:rounded-2xl bg-base-100 border-4 border-base-100 shadow-xl flex items-center justify-center group-hover:scale-110 transition-transform overflow-hidden z-20">
            {team.logo ? (
              <img 
                src={team.logo} 
                alt={team.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.nextSibling.style.display = 'flex'
                }}
              />
            ) : null}
            <span 
              className="font-epic font-bold text-2xl hidden items-center justify-center w-full h-full"
              style={{ color: team.primaryColor, display: team.logo ? 'none' : 'flex' }}
            >
              {team.shortName}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="pt-10 sm:pt-12 md:pt-16 pb-3 sm:pb-4 px-3 sm:px-4 text-center">
          <h3 className="font-epic font-bold text-base sm:text-lg text-base-content group-hover:text-primary transition-colors">
            {team.name}
          </h3>
          <p className="text-sm text-base-content/60 mb-4">{team.hostel}</p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-1 sm:gap-2 text-center">
            <div className="bg-base-200 rounded-lg py-1.5 sm:py-2">
              <p className="text-base sm:text-lg font-bold text-primary">{team.stats?.wins ?? 0}</p>
              <p className="text-[10px] sm:text-xs text-base-content/60">Wins</p>
            </div>
            <div className="bg-base-200 rounded-lg py-1.5 sm:py-2">
              <p className="text-base sm:text-lg font-bold text-error">{team.stats?.losses ?? 0}</p>
              <p className="text-[10px] sm:text-xs text-base-content/60">Losses</p>
            </div>
            <div className="bg-base-200 rounded-lg py-1.5 sm:py-2">
              <p className="text-base sm:text-lg font-bold text-secondary">{team.stats?.points ?? 0}</p>
              <p className="text-[10px] sm:text-xs text-base-content/60">Points</p>
            </div>
          </div>
        </div>

        {/* Motto */}
        <div 
          className="px-4 py-2 text-center text-xs font-medium text-white"
          style={{ backgroundColor: team.secondaryColor || team.primaryColor }}
        >
          "{team.motto}"
        </div>
      </motion.div>
    </Link>
  )
}

export default TeamCard
