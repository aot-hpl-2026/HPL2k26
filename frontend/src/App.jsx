import { Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Layout } from './components/layout'

// Pages
import Home from './pages/Home'
import Teams from './pages/Teams'
import Team from './pages/Team'
import Matches from './pages/Matches'
import Match from './pages/Match'
import Player from './pages/Player'
import PointsTable from './pages/PointsTable'
import Admin from './pages/Admin'

function App() {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        {/* Public Routes with Layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="teams" element={<Teams />} />
          <Route path="team/:teamId" element={<Team />} />
          <Route path="matches" element={<Matches />} />
          <Route path="match/:matchId" element={<Match />} />
          <Route path="player/:playerId" element={<Player />} />
          <Route path="points-table" element={<PointsTable />} />
        </Route>
        
        {/* Admin Route (without main layout) */}
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </AnimatePresence>
  )
}

export default App
