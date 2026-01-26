import { motion } from 'framer-motion'

const Card = ({ 
  children, 
  className = '', 
  hover = true,
  padding = true,
  onClick = null 
}) => {
  return (
    <motion.div
      whileHover={hover ? { y: -4, boxShadow: '0 10px 40px rgba(139, 21, 56, 0.15)' } : {}}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      className={`
        bg-base-100 rounded-xl border border-base-200 overflow-hidden
        ${hover ? 'cursor-pointer' : ''}
        ${padding ? 'p-6' : ''}
        ${className}
      `}
    >
      {children}
    </motion.div>
  )
}

export default Card
