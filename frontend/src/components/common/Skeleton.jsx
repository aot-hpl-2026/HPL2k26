import { motion } from 'framer-motion'

const SkeletonCard = ({ className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`bg-base-200 rounded-xl overflow-hidden ${className}`}
    >
      <div className="animate-shimmer h-40 bg-base-300" />
      <div className="p-4 space-y-3">
        <div className="animate-shimmer h-6 bg-base-300 rounded w-3/4" />
        <div className="animate-shimmer h-4 bg-base-300 rounded w-1/2" />
        <div className="animate-shimmer h-4 bg-base-300 rounded w-full" />
      </div>
    </motion.div>
  )
}

export const SkeletonRow = ({ cols = 4 }) => (
  <div className="flex gap-4 p-4 animate-pulse">
    {Array.from({ length: cols }).map((_, i) => (
      <div key={i} className="flex-1 h-6 bg-base-300 rounded" />
    ))}
  </div>
)

export const SkeletonText = ({ lines = 3, className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <div 
        key={i} 
        className="animate-shimmer h-4 bg-base-300 rounded" 
        style={{ width: `${Math.random() * 40 + 60}%` }}
      />
    ))}
  </div>
)

export default SkeletonCard
