import { motion } from 'framer-motion'
import { HiInbox } from 'react-icons/hi2'

const EmptyState = ({ 
  title = 'No data found',
  description = 'There is nothing to display here yet.',
  icon: Icon = HiInbox,
  action = null,
  className = '' 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center p-12 text-center ${className}`}
    >
      <div className="w-20 h-20 rounded-full bg-base-200 flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-base-content/40" />
      </div>
      <h3 className="text-xl font-epic font-semibold text-base-content mb-2">{title}</h3>
      <p className="text-base-content/60 max-w-md mb-6">{description}</p>
      {action}
    </motion.div>
  )
}

export default EmptyState
