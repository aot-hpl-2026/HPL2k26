import { motion } from 'framer-motion'
import { useCountUp } from '../../hooks'

const StatCard = ({ 
  label, 
  value, 
  icon: Icon = null, 
  suffix = '', 
  color = 'primary',
  animate = true 
}) => {
  const displayValue = animate ? useCountUp(value) : value

  const colors = {
    primary: 'from-hpl-maroon to-hpl-crimson',
    secondary: 'from-hpl-gold to-hpl-bronze',
    accent: 'from-hpl-navy to-hpl-midnight',
    success: 'from-green-500 to-green-600',
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className="bg-base-100 rounded-xl border border-base-200 p-5 relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${colors[color]} opacity-10 rounded-full -translate-y-8 translate-x-8`} />
      
      <div className="relative">
        {Icon && (
          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colors[color]} flex items-center justify-center mb-3`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        )}
        <p className="text-base-content/60 text-sm mb-1">{label}</p>
        <p className="text-3xl font-epic font-bold text-base-content">
          {displayValue}{suffix}
        </p>
      </div>
    </motion.div>
  )
}

export default StatCard
