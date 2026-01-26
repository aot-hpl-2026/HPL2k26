import { motion } from 'framer-motion'

const Badge = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  pulse = false,
  className = '' 
}) => {
  const variants = {
    primary: 'bg-primary text-primary-content',
    secondary: 'bg-secondary text-secondary-content',
    accent: 'bg-accent text-accent-content',
    success: 'bg-success text-white',
    warning: 'bg-warning text-white',
    error: 'bg-error text-white',
    live: 'bg-red-500 text-white',
    outline: 'border-2 border-primary text-primary bg-transparent',
  }

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  }

  return (
    <motion.span
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`
        inline-flex items-center gap-1 rounded-full font-medium
        ${variants[variant]} 
        ${sizes[size]}
        ${pulse ? 'animate-pulse-gold' : ''}
        ${className}
      `}
    >
      {variant === 'live' && (
        <span className="w-2 h-2 rounded-full bg-white animate-blink" />
      )}
      {children}
    </motion.span>
  )
}

export default Badge
