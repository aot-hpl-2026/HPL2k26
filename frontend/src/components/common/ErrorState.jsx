import { motion } from 'framer-motion'
import { HiExclamationCircle, HiArrowPath } from 'react-icons/hi2'

const ErrorState = ({ 
  message = 'Something went wrong', 
  onRetry = null,
  className = '' 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex flex-col items-center justify-center p-8 text-center ${className}`}
    >
      <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mb-4">
        <HiExclamationCircle className="w-8 h-8 text-error" />
      </div>
      <h3 className="text-lg font-semibold text-base-content mb-2">Oops!</h3>
      <p className="text-base-content/60 mb-4">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn btn-outline btn-error btn-sm gap-2">
          <HiArrowPath className="w-4 h-4" />
          Try Again
        </button>
      )}
    </motion.div>
  )
}

export default ErrorState
