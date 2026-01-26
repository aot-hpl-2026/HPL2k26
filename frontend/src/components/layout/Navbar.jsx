import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  HiHome, 
  HiUserGroup, 
  HiCalendar, 
  HiTableCells, 
  HiCog6Tooth,
  HiBars3,
  HiXMark,
  HiSun,
  HiMoon
} from 'react-icons/hi2'
import { useTheme } from '../../hooks'

const navLinks = [
  { to: '/', label: 'Home', icon: HiHome },
  { to: '/teams', label: 'Teams', icon: HiUserGroup },
  { to: '/matches', label: 'Matches', icon: HiCalendar },
  { to: '/points-table', label: 'Points Table', icon: HiTableCells },
]

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { theme, toggleTheme, isDark } = useTheme()

  return (
    <nav className="bg-base-100 shadow-lg sticky top-0 z-50 border-b-2 border-hpl-gold/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden bg-gradient-to-br from-hpl-maroon to-hpl-navy shadow-md">
              <img 
                src="/images/HPL.png" 
                alt="HPL Logo"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.nextSibling.style.display = 'flex'
                }}
              />
              <div className="w-full h-full bg-gradient-to-br from-hpl-maroon to-hpl-gold hidden items-center justify-center">
                <span className="text-white font-epic font-bold text-lg">H</span>
              </div>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-epic font-bold text-xl gradient-text">HPL 2026</h1>
              <p className="text-xs text-base-content/60">Hostel Premier League</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    isActive
                      ? 'bg-primary text-primary-content'
                      : 'hover:bg-base-200 text-base-content'
                  }`
                }
              >
                <link.icon className="w-5 h-5" />
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="btn btn-ghost btn-circle"
              aria-label="Toggle theme"
            >
              {isDark ? <HiSun className="w-5 h-5" /> : <HiMoon className="w-5 h-5" />}
            </button>

            {/* Admin Link */}
            <Link to="/admin" className="btn btn-outline btn-primary btn-sm hidden sm:flex">
              <HiCog6Tooth className="w-4 h-4" />
              Admin
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="btn btn-ghost btn-circle md:hidden"
              aria-label="Toggle menu"
            >
              {isOpen ? <HiXMark className="w-6 h-6" /> : <HiBars3 className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-base-200"
          >
            <div className="container mx-auto px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                      isActive
                        ? 'bg-primary text-primary-content'
                        : 'hover:bg-base-200 text-base-content'
                    }`
                  }
                >
                  <link.icon className="w-5 h-5" />
                  {link.label}
                </NavLink>
              ))}
              <Link
                to="/admin"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium hover:bg-base-200 text-base-content"
              >
                <HiCog6Tooth className="w-5 h-5" />
                Admin Panel
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

export default Navbar
