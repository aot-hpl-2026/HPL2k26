// Utility functions for HPL 2026

// Format date to readable string
export const formatDate = (dateString) => {
  const options = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }
  return new Date(dateString).toLocaleDateString('en-IN', options)
}

// Format time to readable string
export const formatTime = (timeString) => {
  const [hours, minutes] = timeString.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const formattedHour = hour % 12 || 12
  return `${formattedHour}:${minutes} ${ampm}`
}

// Calculate run rate
export const calculateRunRate = (runs, overs) => {
  if (!overs || overs === 0) return 0
  const totalBalls = Math.floor(overs) * 6 + (overs % 1) * 10
  return ((runs / totalBalls) * 6).toFixed(2)
}

// Format overs display
export const formatOvers = (overs) => {
  if (!overs) return '0.0'
  return overs.toFixed(1)
}

// Get match status label
export const getMatchStatusLabel = (status) => {
  switch (status) {
    case 'live': return 'LIVE'
    case 'upcoming': return 'Upcoming'
    case 'completed': return 'Completed'
    default: return status
  }
}

// Get match status color classes
export const getMatchStatusColor = (status) => {
  switch (status) {
    case 'live': return 'bg-red-500 text-white'
    case 'upcoming': return 'bg-hpl-gold text-hpl-dark'
    case 'completed': return 'bg-hpl-stone text-white'
    default: return 'bg-gray-500 text-white'
  }
}

// Format player role
export const formatRole = (role) => {
  const roleColors = {
    'Batsman': 'badge-primary',
    'Bowler': 'badge-secondary',
    'All-rounder': 'badge-accent',
    'Wicket-keeper': 'badge-info',
  }
  return roleColors[role] || 'badge-neutral'
}

// Truncate text
export const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// Get ordinal suffix
export const getOrdinal = (n) => {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

// Get NRR display with sign
export const formatNRR = (nrr) => {
  if (nrr > 0) return `+${nrr.toFixed(2)}`
  return nrr.toFixed(2)
}

// Generate placeholder avatar URL
export const getAvatarUrl = (name) => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=8B1538&color=fff&size=128`
}

// Debounce function
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}
