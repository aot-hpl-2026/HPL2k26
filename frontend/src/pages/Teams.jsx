import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { teamsApi } from '../services/api'
import { TeamCard } from '../components/team'
import { SectionHeader, LoadingSpinner, SkeletonCard } from '../components/common'

const Teams = () => {
  const { data: teamsData, isLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: teamsApi.getAllTeams,
  })

  const teams = teamsData?.data || []

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="bg-gradient-to-r from-hpl-maroon to-hpl-navy py-8 sm:py-12">
        <div className="container mx-auto px-3 sm:px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-3xl sm:text-4xl font-epic font-bold text-white mb-3 sm:mb-4">The Clans</h1>
            <p className="text-sm sm:text-base text-white/70 max-w-2xl mx-auto px-2">
              Six mighty teams battle for glory in HPL 2026. Each representing a hostel, 
              carrying the pride of their warriors.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Teams Grid */}
      <section className="py-8 sm:py-12">
        <div className="container mx-auto px-3 sm:px-4">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1 }
                }
              }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8"
            >
              {teams.map((team, index) => (
                <motion.div
                  key={team.id || team._id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                >
                  <TeamCard team={team} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>
    </div>
  )
}

export default Teams
