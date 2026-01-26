import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { teamsApi } from '../services/api'
import { PointsTable as PointsTableComponent } from '../components/team'
import { LoadingSpinner } from '../components/common'

const PointsTablePage = () => {
  const { data: pointsData, isLoading } = useQuery({
    queryKey: ['pointsTable'],
    queryFn: teamsApi.getPointsTable,
  })

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
            <h1 className="text-3xl sm:text-4xl font-epic font-bold text-white mb-3 sm:mb-4">Points Table</h1>
            <p className="text-sm sm:text-base text-white/70 max-w-2xl mx-auto px-2">
              The battle for supremacy. Track which clans are rising to glory.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Points Table */}
      <section className="py-8 sm:py-12">
        <div className="container mx-auto px-3 sm:px-4 max-w-4xl">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <PointsTableComponent teams={pointsData?.data || []} />
            </motion.div>
          )}
        </div>
      </section>

      {/* Legend */}
      <section className="pb-8 sm:pb-12">
        <div className="container mx-auto px-3 sm:px-4 max-w-4xl">
          <div className="bg-base-100 rounded-xl border border-base-200 p-4 sm:p-6">
            <h3 className="font-epic font-semibold text-base sm:text-lg mb-3 sm:mb-4">How it Works</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-xs sm:text-sm text-base-content/70">
              <div>
                <h4 className="font-semibold text-base-content mb-2">Points System</h4>
                <ul className="space-y-1">
                  <li>• Win: 2 points</li>
                  <li>• Loss: 0 points</li>
                  <li>• No Result: 1 point each</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-base-content mb-2">Playoffs Qualification</h4>
                <ul className="space-y-1">
                  <li>• Top 4 teams qualify for playoffs</li>
                  <li>• Teams ranked by points, then NRR</li>
                  <li>• Semi-finals followed by Final</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default PointsTablePage
