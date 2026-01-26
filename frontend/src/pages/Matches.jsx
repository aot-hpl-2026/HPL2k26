import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { matchesApi } from '../services/api'
import { MatchCard } from '../components/match'
import { SectionHeader, LoadingSpinner, EmptyState, SkeletonCard } from '../components/common'

const Matches = () => {
  const [filter, setFilter] = useState('all')

  const { data: allMatches, isLoading } = useQuery({
    queryKey: ['matches'],
    queryFn: matchesApi.getAllMatches,
  })

  const matches = allMatches?.data || []

  const filteredMatches = filter === 'all' 
    ? matches 
    : matches.filter(m => m.status === filter)

  const filters = [
    { id: 'all', label: 'All Matches' },
    { id: 'live', label: '🔴 Live' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'completed', label: 'Completed' },
  ]

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
            <h1 className="text-3xl sm:text-4xl font-epic font-bold text-white mb-3 sm:mb-4">Matches</h1>
            <p className="text-sm sm:text-base text-white/70 max-w-2xl mx-auto px-2">
              Every battle tells a story. Follow all the clashes of HPL 2026.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-4 sm:py-6 bg-base-200 sticky top-16 z-30">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`
                  px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-sm sm:text-base font-medium transition-all whitespace-nowrap
                  ${filter === f.id 
                    ? 'bg-primary text-primary-content' 
                    : 'bg-base-100 text-base-content hover:bg-base-300'
                  }
                `}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Matches Grid */}
      <section className="py-6 sm:py-8">
        <div className="container mx-auto px-3 sm:px-4">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filteredMatches.length > 0 ? (
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
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
            >
              {filteredMatches.map((match) => (
                <motion.div
                  key={match.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                >
                  <MatchCard match={match} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <EmptyState 
              title="No matches found" 
              description={`No ${filter} matches at the moment`}
            />
          )}
        </div>
      </section>
    </div>
  )
}

export default Matches
