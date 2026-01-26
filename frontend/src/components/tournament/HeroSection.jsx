import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { HiArrowRight } from 'react-icons/hi2'

const HeroSection = ({ tournament }) => {
  return (
    <section className="relative bg-gradient-to-br from-hpl-maroon via-hpl-navy to-hpl-midnight overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23D4AF37' fill-opacity='0.5' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="container mx-auto px-4 py-16 md:py-24 relative">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex-1 text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-block mb-4"
            >
              <span className="bg-hpl-gold/20 text-hpl-gold px-4 py-1 rounded-full text-sm font-medium">
                Season 2026
              </span>
            </motion.div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-epic font-bold text-white mb-4 leading-tight">
              {tournament.name}
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl text-hpl-gold font-epic mb-6">
              "{tournament.tagline}"
            </p>
            
            <p className="text-white/70 max-w-xl mb-8">
              {tournament.description}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
              <Link 
                to="/matches" 
                className="btn btn-md sm:btn-lg bg-hpl-gold text-hpl-dark border-none hover:bg-hpl-bronze"
              >
                View Matches
                <HiArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                to="/teams" 
                className="btn btn-md sm:btn-lg btn-outline border-white text-white hover:bg-white hover:text-hpl-navy"
              >
                Explore Teams
              </Link>
            </div>
          </motion.div>

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex-1 flex justify-center"
          >
            <div className="relative">
              {/* Animated outer glow rings radiating outward */}
              <motion.div 
                className="absolute -inset-8 sm:-inset-12 md:-inset-16 bg-gradient-to-r from-transparent via-hpl-gold/30 to-transparent blur-3xl rounded-full"
                animate={{ 
                  scale: [1, 1.15, 1],
                  opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              <motion.div 
                className="absolute -inset-6 sm:-inset-8 md:-inset-12 bg-gradient-to-br from-transparent via-hpl-maroon/25 to-transparent blur-2xl rounded-full"
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.4, 0.6, 0.4]
                }}
                transition={{ 
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5
                }}
              />
              
              <motion.div 
                className="absolute -inset-4 sm:-inset-6 md:-inset-8 bg-gradient-to-r from-transparent via-hpl-gold/35 to-transparent blur-xl rounded-full"
                animate={{ 
                  scale: [1, 1.08, 1],
                  opacity: [0.5, 0.7, 0.5]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
              />
              
              {/* Static inner glow for depth */}
              <div className="absolute -inset-2 sm:-inset-3 md:-inset-4 bg-gradient-to-br from-hpl-gold/20 via-hpl-bronze/15 to-hpl-gold/20 blur-lg rounded-full" />
              
              {/* Logo container */}
              <div className="relative w-56 h-56 sm:w-72 sm:h-72 md:w-80 md:h-80 lg:w-[420px] lg:h-[420px] rounded-full flex items-center justify-center overflow-hidden ring-2 ring-hpl-gold/40 shadow-lg shadow-hpl-gold/30">
                <img 
                  src="/images/HPL.png" 
                  alt="HPL 2026"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'flex'
                  }}
                />
                <div className="text-center hidden items-center justify-center flex-col bg-gradient-to-br from-hpl-maroon to-hpl-navy w-full h-full rounded-full border-4 border-hpl-gold/30">
                  <span className="font-epic font-bold text-6xl md:text-7xl text-white">HPL</span>
                  <p className="font-epic text-hpl-gold text-xl">2026</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tournament Info */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { label: 'Teams', value: tournament.totalTeams },
            { label: 'Matches', value: tournament.totalMatches },
            { label: 'Format', value: tournament.format },
            { label: 'Venue', value: tournament.venue },
          ].map((item, index) => (
            <div 
              key={index}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center"
            >
              <p className="text-2xl md:text-3xl font-epic font-bold text-white">{item.value}</p>
              <p className="text-white/60 text-sm">{item.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default HeroSection
