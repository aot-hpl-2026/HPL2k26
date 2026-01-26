// Helper to get player ID from either _id or id
const getPlayerId = (player) => player?._id || player?.id;
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { 
  HiUserGroup, 
  HiCalendar, 
  HiChartBar,
  HiPlay,
  HiStop,
  HiLockClosed,
  HiEye,
  HiEyeSlash,
  HiXMark,
  HiPlus,
  HiPencil,
  HiTrash,
  HiArrowPath,
  HiUsers,
  HiTrophy,
  HiCog6Tooth,
  HiPlayCircle,
  HiArrowLeft,
  HiCheck,
  HiExclamationTriangle,
  HiArrowsRightLeft,
  HiArrowUturnLeft,
  HiTableCells,
  HiChevronRight
} from 'react-icons/hi2'
import { authApi, matchesApi, teamsApi, playersApi } from '../services/api'
import { socketService } from '../services/socket'

// ============ ADMIN LOGIN COMPONENT ============
const AdminLogin = ({ onLogin }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await authApi.login(email, password)
      
      if (result.success) {
        authApi.setToken(result.data.token)
        authApi.setAdmin(result.data.organizer)
        await socketService.connectAdmin(result.data.token)
        onLogin(true, result.data.organizer)
        toast.success('Welcome to HPL 2026 Admin Panel!')
      } else {
        setError(result.error || 'Invalid credentials')
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-hpl-maroon to-hpl-navy p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-base-100 rounded-2xl shadow-2xl p-8 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-hpl-maroon to-hpl-gold rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <HiLockClosed className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-epic font-bold text-base-content">HPL 2026</h1>
          <p className="text-base-content/60 mt-2">Organizer Admin Panel</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Email</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@hpl.com"
              className="input input-bordered w-full"
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Password</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input input-bordered w-full pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/50 hover:text-base-content"
              >
                {showPassword ? <HiEyeSlash className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="alert alert-error text-sm py-2">
              <span>{error}</span>
            </div>
          )}

          <button type="submit" className="btn btn-primary w-full" disabled={isLoading}>
            {isLoading ? <span className="loading loading-spinner"></span> : 'Login to Admin Panel'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}

// ============ MODAL COMPONENT ============
const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
    full: 'max-w-6xl'
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className={`bg-base-100 rounded-2xl shadow-2xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-4 border-b border-base-200 bg-gradient-to-r from-hpl-maroon to-hpl-navy">
            <h3 className="font-epic font-bold text-lg text-white">{title}</h3>
            <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle text-white hover:bg-white/20">
              <HiXMark className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-4rem)]">
            {children}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ============ TEAM CARD COMPONENT ============
const TeamManagementCard = ({ team, onEdit, onManagePlayers }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-base-100 rounded-xl border border-base-200 overflow-hidden hover:shadow-lg transition-shadow"
    >
      {/* Team Header */}
      <div 
        className="h-24 relative"
        style={{ backgroundColor: team.primaryColor || '#8B1538' }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/50 to-transparent">
          <p className="text-white/80 text-sm font-medium">{team.hostel || 'Hostel'}</p>
        </div>
      </div>

      {/* Logo */}
      <div className="relative -mt-10 px-4">
        <div className="w-20 h-20 bg-white rounded-xl shadow-lg flex items-center justify-center overflow-hidden border-4 border-base-100">
          {team.logo ? (
            <img src={team.logo} alt={team.name} className="w-full h-full object-contain p-1" />
          ) : (
            <span className="font-epic font-bold text-2xl" style={{ color: team.primaryColor }}>
              {team.shortName}
            </span>
          )}
        </div>
      </div>

      {/* Team Info */}
      <div className="p-4 pt-2">
        <h3 className="font-epic font-bold text-lg">{team.name}</h3>
        <p className="text-sm text-base-content/60 mb-3">"{team.motto}"</p>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="text-center p-2 bg-base-200 rounded-lg">
            <p className="text-lg font-bold text-primary">{team.stats?.matchesPlayed ?? 0}</p>
            <p className="text-xs text-base-content/60">Played</p>
          </div>
          <div className="text-center p-2 bg-base-200 rounded-lg">
            <p className="text-lg font-bold text-success">{team.stats?.wins ?? 0}</p>
            <p className="text-xs text-base-content/60">Wins</p>
          </div>
          <div className="text-center p-2 bg-base-200 rounded-lg">
            <p className="text-lg font-bold text-error">{team.stats?.losses ?? 0}</p>
            <p className="text-xs text-base-content/60">Losses</p>
          </div>
          <div className="text-center p-2 bg-base-200 rounded-lg">
            <p className="text-lg font-bold text-secondary">{team.stats?.points ?? 0}</p>
            <p className="text-xs text-base-content/60">Points</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button 
            onClick={() => onManagePlayers(team)}
            className="btn btn-sm btn-outline flex-1 gap-1"
          >
            <HiUsers className="w-4 h-4" /> Players
          </button>
          <button 
            onClick={() => onEdit(team)}
            className="btn btn-sm btn-primary flex-1 gap-1"
          >
            <HiPencil className="w-4 h-4" /> Edit
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ============ TEAMS MANAGEMENT TAB ============
const TeamsTab = () => {
  const queryClient = useQueryClient()
  const [showEditModal, setShowEditModal] = useState(false)
  const [showPlayersModal, setShowPlayersModal] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [editForm, setEditForm] = useState({})

  const { data: teamsData, isLoading } = useQuery({
    queryKey: ['admin-teams'],
    queryFn: teamsApi.getAllTeams
  })

  const { data: playersData } = useQuery({
    queryKey: ['admin-players'],
    queryFn: playersApi.getAllPlayers
  })

  const teams = teamsData?.data || []
  const allPlayers = playersData?.data || []

  const updateTeamMutation = useMutation({
    mutationFn: ({ teamId, data }) => teamsApi.updateTeam(teamId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-teams'])
      setShowEditModal(false)
      toast.success('Team updated successfully!')
    },
    onError: (error) => {
      toast.error('Failed to update team: ' + (error?.message || 'Unknown error'))
    }
  })

  const handleEditTeam = (team) => {
    setSelectedTeam(team)
    setEditForm({
      name: team.name || '',
      shortName: team.shortName || '',
      hostel: team.hostel || '',
      description: team.description || '',
      motto: team.motto || '',
      primaryColor: team.primaryColor || '#8B1538',
      secondaryColor: team.secondaryColor || '#FFD700'
    })
    setShowEditModal(true)
  }

  const handleManagePlayers = (team) => {
    setSelectedTeam(team)
    setShowPlayersModal(true)
  }

  const handleUpdateTeam = (e) => {
    e.preventDefault()
    updateTeamMutation.mutate({
      teamId: selectedTeam._id,
      data: editForm
    })
  }

  const getTeamPlayers = (teamId) => {
    return allPlayers.filter(p => {
      const pTeamId = p.team?._id || p.team
      return pTeamId === teamId || pTeamId?.toString() === teamId?.toString()
    })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-epic font-bold text-2xl">Teams Management</h2>
          <p className="text-base-content/60">Manage all 6 HPL 2026 teams</p>
        </div>
        <button 
          onClick={() => queryClient.invalidateQueries(['admin-teams'])}
          className="btn btn-ghost btn-sm gap-2"
        >
          <HiArrowPath className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team) => (
          <TeamManagementCard
            key={team._id}
            team={team}
            onEdit={handleEditTeam}
            onManagePlayers={handleManagePlayers}
          />
        ))}
      </div>

      {/* Edit Team Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={`Edit ${selectedTeam?.name || 'Team'}`}
        size="md"
      >
        <form onSubmit={handleUpdateTeam} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label"><span className="label-text">Team Name</span></label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                className="input input-bordered"
                required
              />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Short Name</span></label>
              <input
                type="text"
                value={editForm.shortName}
                onChange={(e) => setEditForm(prev => ({ ...prev, shortName: e.target.value }))}
                className="input input-bordered"
                maxLength={4}
              />
            </div>
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text">Hostel</span></label>
            <input
              type="text"
              value={editForm.hostel}
              onChange={(e) => setEditForm(prev => ({ ...prev, hostel: e.target.value }))}
              className="input input-bordered"
            />
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text">Motto</span></label>
            <input
              type="text"
              value={editForm.motto}
              onChange={(e) => setEditForm(prev => ({ ...prev, motto: e.target.value }))}
              className="input input-bordered"
            />
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text">Description</span></label>
            <textarea
              value={editForm.description}
              onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
              className="textarea textarea-bordered"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label"><span className="label-text">Primary Color</span></label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={editForm.primaryColor}
                  onChange={(e) => setEditForm(prev => ({ ...prev, primaryColor: e.target.value }))}
                  className="w-12 h-12 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={editForm.primaryColor}
                  onChange={(e) => setEditForm(prev => ({ ...prev, primaryColor: e.target.value }))}
                  className="input input-bordered flex-1"
                />
              </div>
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Secondary Color</span></label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={editForm.secondaryColor}
                  onChange={(e) => setEditForm(prev => ({ ...prev, secondaryColor: e.target.value }))}
                  className="w-12 h-12 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={editForm.secondaryColor}
                  onChange={(e) => setEditForm(prev => ({ ...prev, secondaryColor: e.target.value }))}
                  className="input input-bordered flex-1"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={() => setShowEditModal(false)} className="btn btn-ghost">
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={updateTeamMutation.isPending}
            >
              {updateTeamMutation.isPending ? <span className="loading loading-spinner loading-sm"></span> : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Players Management Modal */}
      <Modal
        isOpen={showPlayersModal}
        onClose={() => setShowPlayersModal(false)}
        title={`${selectedTeam?.name || 'Team'} - Players`}
        size="lg"
      >
        <PlayersManager 
          team={selectedTeam} 
          players={getTeamPlayers(selectedTeam?._id)}
          onClose={() => setShowPlayersModal(false)}
        />
      </Modal>
    </div>
  )
}

// ============ PLAYERS MANAGER COMPONENT ============
const PlayersManager = ({ team, players, onClose }) => {
  const queryClient = useQueryClient()
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingPlayer, setEditingPlayer] = useState(null)
  const [form, setForm] = useState({
    name: '',
    jerseyNumber: '',
    role: 'Batsman',
    battingStyle: 'Right-hand',
    bowlingStyle: 'None',
    isCaptain: false
  })

  const createPlayerMutation = useMutation({
    mutationFn: (data) => playersApi.createPlayer({ ...data, teamId: team._id }),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-players'])
      resetForm()
      toast.success('Player added successfully!')
    },
    onError: (error) => {
      toast.error('Failed to add player: ' + (error?.message || 'Unknown error'))
    }
  })

  const updatePlayerMutation = useMutation({
    mutationFn: ({ playerId, data }) => playersApi.updatePlayer(playerId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-players'])
      resetForm()
      toast.success('Player updated successfully!')
    },
    onError: (error) => {
      toast.error('Failed to update player: ' + (error?.message || 'Unknown error'))
    }
  })

  const deletePlayerMutation = useMutation({
    mutationFn: (playerId) => playersApi.deletePlayer(playerId),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-players'])
      toast.success('Player removed successfully!')
    },
    onError: (error) => {
      toast.error('Failed to remove player: ' + (error?.message || 'Unknown error'))
    }
  })

  const resetForm = () => {
    setForm({
      name: '',
      jerseyNumber: '',
      role: 'Batsman',
      battingStyle: 'Right-hand',
      bowlingStyle: 'None',
      isCaptain: false
    })
    setShowAddForm(false)
    setEditingPlayer(null)
  }

  const handleEdit = (player) => {
    setEditingPlayer(player)
    setForm({
      name: player.name || '',
      jerseyNumber: player.jerseyNumber || '',
      role: player.role || 'Batsman',
      battingStyle: player.battingStyle || 'Right-hand',
      bowlingStyle: player.bowlingStyle || 'None',
      isCaptain: player.isCaptain || false
    })
    setShowAddForm(true)
  }

  // Helper to prepare form data for submission
  const prepareFormData = (formData) => {
    const data = { ...formData }
    // Convert jerseyNumber to number if provided, otherwise remove it
    if (data.jerseyNumber !== '' && data.jerseyNumber !== undefined) {
      data.jerseyNumber = parseInt(data.jerseyNumber, 10)
    } else {
      delete data.jerseyNumber
    }
    return data
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const preparedData = prepareFormData(form)
    if (editingPlayer) {
      updatePlayerMutation.mutate({ playerId: editingPlayer._id, data: preparedData })
    } else {
      createPlayerMutation.mutate(preparedData)
    }
  }

  const handleDelete = (player) => {
    if (window.confirm(`Remove ${player.name} from the team?`)) {
      deletePlayerMutation.mutate(player._id)
    }
  }

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'Batsman': return 'badge-primary'
      case 'Bowler': return 'badge-secondary'
      case 'All-Rounder': return 'badge-accent'
      case 'Wicket-Keeper': return 'badge-info'
      default: return 'badge-ghost'
    }
  }

  return (
    <div className="space-y-4">
      {/* Add Player Button */}
      {!showAddForm && (
        <button 
          onClick={() => setShowAddForm(true)}
          className="btn btn-primary gap-2 w-full"
        >
          <HiPlus className="w-4 h-4" /> Add New Player
        </button>
      )}

      {/* Add/Edit Form */}
      {showAddForm && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          onSubmit={handleSubmit}
          className="bg-base-200 rounded-xl p-4 space-y-4"
        >
          <h4 className="font-semibold">{editingPlayer ? 'Edit Player' : 'Add New Player'}</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label"><span className="label-text">Name</span></label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                className="input input-bordered input-sm"
                required
              />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Jersey #</span></label>
              <input
                type="number"
                value={form.jerseyNumber}
                onChange={(e) => setForm(prev => ({ ...prev, jerseyNumber: e.target.value }))}
                className="input input-bordered input-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label"><span className="label-text">Role</span></label>
              <select
                value={form.role}
                onChange={(e) => setForm(prev => ({ ...prev, role: e.target.value }))}
                className="select select-bordered select-sm"
              >
                <option value="Batsman">Batsman</option>
                <option value="Bowler">Bowler</option>
                <option value="All-Rounder">All-Rounder</option>
                <option value="Wicket-Keeper">Wicket-Keeper</option>
              </select>
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Batting Style</span></label>
              <select
                value={form.battingStyle}
                onChange={(e) => setForm(prev => ({ ...prev, battingStyle: e.target.value }))}
                className="select select-bordered select-sm"
              >
                <option value="Right-hand">Right-hand</option>
                <option value="Left-hand">Left-hand</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label"><span className="label-text">Bowling Style</span></label>
              <select
                value={form.bowlingStyle}
                onChange={(e) => setForm(prev => ({ ...prev, bowlingStyle: e.target.value }))}
                className="select select-bordered select-sm"
              >
                <option value="None">None</option>
                <option value="Right-arm Fast">Right-arm Fast</option>
                <option value="Right-arm Medium">Right-arm Medium</option>
                <option value="Right-arm Off-spin">Right-arm Off-spin</option>
                <option value="Right-arm Leg-spin">Right-arm Leg-spin</option>
                <option value="Left-arm Fast">Left-arm Fast</option>
                <option value="Left-arm Medium">Left-arm Medium</option>
                <option value="Left-arm Orthodox">Left-arm Orthodox</option>
                <option value="Left-arm Chinaman">Left-arm Chinaman</option>
              </select>
            </div>
            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-3">
                <input
                  type="checkbox"
                  checked={form.isCaptain}
                  onChange={(e) => setForm(prev => ({ ...prev, isCaptain: e.target.checked }))}
                  className="checkbox checkbox-primary checkbox-sm"
                />
                <span className="label-text">Team Captain</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={resetForm} className="btn btn-ghost btn-sm">
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary btn-sm"
              disabled={createPlayerMutation.isPending || updatePlayerMutation.isPending}
            >
              {(createPlayerMutation.isPending || updatePlayerMutation.isPending) 
                ? <span className="loading loading-spinner loading-sm"></span> 
                : (editingPlayer ? 'Update' : 'Add Player')}
            </button>
          </div>
        </motion.form>
      )}

      {/* Players List */}
      <div className="space-y-2">
        {players.length === 0 ? (
          <div className="text-center py-8 text-base-content/60">
            <HiUsers className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No players in this team yet</p>
          </div>
        ) : (
          players.map((player, index) => (
            <motion.div
              key={player._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between p-3 bg-base-200 rounded-lg hover:bg-base-300 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: team?.primaryColor || '#8B1538' }}
                >
                  {player.jerseyNumber || '#'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{player.name}</span>
                    {player.isCaptain && (
                      <span className="badge badge-warning badge-xs">C</span>
                    )}
                  </div>
                  <div className="flex gap-2 mt-1">
                    <span className={`badge badge-sm ${getRoleBadgeClass(player.role)}`}>
                      {player.role}
                    </span>
                    <span className="text-xs text-base-content/60">
                      {player.battingStyle}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-1">
                <button 
                  onClick={() => handleEdit(player)}
                  className="btn btn-ghost btn-xs btn-square"
                >
                  <HiPencil className="w-3 h-3" />
                </button>
                <button 
                  onClick={() => handleDelete(player)}
                  className="btn btn-ghost btn-xs btn-square text-error"
                  disabled={deletePlayerMutation.isPending}
                >
                  <HiTrash className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}

// ============ MATCHES TAB ============
const MatchesTab = ({ onGoToScoring }) => {
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [matchToDelete, setMatchToDelete] = useState(null)

    const deleteMatchMutation = useMutation({
      mutationFn: (matchId) => matchesApi.deleteMatch(matchId),
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-matches'])
        setShowDeleteModal(false)
        setMatchToDelete(null)
        toast.success('Match deleted successfully!')
      },
      onError: (error) => {
        toast.error('Failed to delete match: ' + (error?.message || 'Unknown error'))
      }
    })

    const handleDeleteMatch = (match) => {
      setMatchToDelete(match)
      setShowDeleteModal(true)
    }
  const queryClient = useQueryClient()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [form, setForm] = useState({
    teamA: '',
    teamB: '',
    venue: 'LPU Stadium',
    scheduledAt: '',
    overs: 6
  })

  const { data: teamsData } = useQuery({
    queryKey: ['admin-teams'],
    queryFn: teamsApi.getAllTeams
  })

  const { data: matchesData, isLoading } = useQuery({
    queryKey: ['admin-matches'],
    queryFn: matchesApi.getAllMatches
  })

  const teams = teamsData?.data || []
  const matches = matchesData?.data || []

  const createMatchMutation = useMutation({
    mutationFn: (data) => matchesApi.createMatch(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-matches'])
      setShowCreateModal(false)
      setForm({ teamA: '', teamB: '', venue: 'LPU Stadium', scheduledAt: '', overs: 6 })
      toast.success('Match scheduled successfully!')
    },
    onError: (error) => {
      toast.error('Failed to create match: ' + (error?.message || 'Unknown error'))
    }
  })

  const updateMatchMutation = useMutation({
    mutationFn: ({ matchId, data }) => matchesApi.updateMatch(matchId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-matches'])
      toast.success('Match updated!')
    }
  })

  const handleCreateMatch = (e) => {
    e.preventDefault()
    createMatchMutation.mutate(form)
  }

  const handleStartMatch = (match) => {
    updateMatchMutation.mutate({
      matchId: match._id,
      data: { status: 'live' }
    })
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'live': return <span className="badge badge-error gap-1"><span className="w-2 h-2 rounded-full bg-white animate-pulse"></span> LIVE</span>
      case 'completed': return <span className="badge badge-success">Completed</span>
      case 'scheduled': return <span className="badge badge-info">Scheduled</span>
      default: return <span className="badge">{status}</span>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-epic font-bold text-2xl">Matches</h2>
          <p className="text-base-content/60">Schedule and manage HPL 2026 matches</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary gap-2"
        >
          <HiPlus className="w-4 h-4" /> Schedule Match
        </button>
      </div>

      {/* Matches List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : matches.length === 0 ? (
        <div className="text-center py-12 bg-base-100 rounded-xl border border-base-200">
          <HiCalendar className="w-16 h-16 mx-auto text-base-content/20 mb-4" />
          <h3 className="font-semibold text-lg mb-2">No Matches Scheduled</h3>
          <p className="text-base-content/60 mb-4">Create your first match to get started</p>
          <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
            Schedule First Match
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map((match) => (
            <motion.div
              key={match._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-base-100 rounded-xl border border-base-200 p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Team A */}
                  <div className="flex items-center gap-2">
                    {match.teamA?.logo && (
                      <img src={match.teamA.logo} alt="" className="w-10 h-10 rounded-lg object-contain bg-white p-1" />
                    )}
                    <div>
                      <p className="font-semibold">{match.teamA?.name || 'TBA'}</p>
                      <p className="text-xs text-base-content/60">{match.teamA?.shortName}</p>
                    </div>
                  </div>

                  <span className="text-xl font-bold text-base-content/30">VS</span>

                  {/* Team B */}
                  <div className="flex items-center gap-2">
                    {match.teamB?.logo && (
                      <img src={match.teamB.logo} alt="" className="w-10 h-10 rounded-lg object-contain bg-white p-1" />
                    )}
                    <div>
                      <p className="font-semibold">{match.teamB?.name || 'TBA'}</p>
                      <p className="text-xs text-base-content/60">{match.teamB?.shortName}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-base-content/60">
                      {new Date(match.scheduledAt).toLocaleDateString()}
                    </p>
                    <p className="text-sm font-medium">
                      {new Date(match.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {getStatusBadge(match.status)}
                  
                  {match.status === 'scheduled' && (
                    <button 
                      onClick={() => handleStartMatch(match)}
                      className="btn btn-success btn-sm gap-1"
                    >
                      <HiPlay className="w-4 h-4" /> Start
                    </button>
                  )}
                  
                  {match.status === 'live' && (
                    <button 
                      onClick={() => onGoToScoring && onGoToScoring()}
                      className="btn btn-primary btn-sm gap-1"
                    >
                      <HiCog6Tooth className="w-4 h-4" /> Score
                    </button>
                  )}
                </div>
              </div>

              {/* Live Score Display */}
              {match.status === 'live' && match.score && (
                <div className="mt-4 pt-4 border-t border-base-200">
                  <div className="flex justify-center gap-8">
                    <div className="text-center">
                          <button
                            className="btn btn-error btn-sm gap-1"
                            onClick={() => handleDeleteMatch(match)}
                            disabled={deleteMatchMutation.isPending}
                          >
                            <HiTrash className="w-4 h-4" /> Delete
                          </button>
                      <p className="text-2xl font-bold">
                        {match.score.runs}/{match.score.wickets}
                            {/* Delete Match Confirmation Modal */}
                            {showDeleteModal && (
                              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                                <div className="bg-base-100 rounded-xl shadow-lg p-6 w-full max-w-md">
                                  <h3 className="font-bold text-lg mb-2 text-error">Delete Match?</h3>
                                  <p className="mb-4">Are you sure you want to delete <span className="font-semibold">{matchToDelete?.teamA?.name} vs {matchToDelete?.teamB?.name}</span> and all its details? This action cannot be undone.</p>
                                  <div className="flex gap-2 justify-end">
                                    <button className="btn btn-ghost" onClick={() => setShowDeleteModal(false)} disabled={deleteMatchMutation.isPending}>Cancel</button>
                                    <button className="btn btn-error" onClick={() => deleteMatchMutation.mutate(matchToDelete._id)} disabled={deleteMatchMutation.isPending}>
                                      {deleteMatchMutation.isPending ? <span className="loading loading-spinner loading-sm"></span> : 'Delete'}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                      </p>
                      <p className="text-sm text-base-content/60">
                        ({match.score.overs} ov)
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Match Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Schedule New Match"
        size="md"
      >
        <form onSubmit={handleCreateMatch} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label"><span className="label-text">Team A</span></label>
              <select
                value={form.teamA}
                onChange={(e) => setForm(prev => ({ ...prev, teamA: e.target.value }))}
                className="select select-bordered"
                required
              >
                <option value="">Select Team</option>
                {teams.map(team => (
                  <option key={team._id} value={team._id}>{team.name}</option>
                ))}
              </select>
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Team B</span></label>
              <select
                value={form.teamB}
                onChange={(e) => setForm(prev => ({ ...prev, teamB: e.target.value }))}
                className="select select-bordered"
                required
              >
                <option value="">Select Team</option>
                {teams.filter(t => t._id !== form.teamA).map(team => (
                  <option key={team._id} value={team._id}>{team.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text">Venue</span></label>
            <input
              type="text"
              value={form.venue}
              onChange={(e) => setForm(prev => ({ ...prev, venue: e.target.value }))}
              className="input input-bordered"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label"><span className="label-text">Date & Time</span></label>
              <input
                type="datetime-local"
                value={form.scheduledAt}
                onChange={(e) => setForm(prev => ({ ...prev, scheduledAt: e.target.value }))}
                className="input input-bordered"
                required
              />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Overs</span></label>
              <input
                type="number"
                value={form.overs}
                onChange={(e) => setForm(prev => ({ ...prev, overs: parseInt(e.target.value) }))}
                className="input input-bordered"
                min={1}
                max={50}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-ghost">
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={createMatchMutation.isPending}
            >
              {createMatchMutation.isPending ? <span className="loading loading-spinner loading-sm"></span> : 'Schedule Match'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

// ============ SCORING TAB ============
// ============ COMPREHENSIVE CRICKET SCORING SYSTEM ============
const ScoringTab = () => {
  const queryClient = useQueryClient()
  
  // Core state
  const [selectedMatch, setSelectedMatch] = useState(null)
  const [scoringPhase, setScoringPhase] = useState('select') // 'select', 'setup', 'scoring', 'scorecard'
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)
  
  // Match setup state
  const [setupData, setSetupData] = useState({
    tossWinner: '',
    tossDecision: 'bat',
    striker: null,
    nonStriker: null,
    bowler: null
  })
  
  // Live scoring state - comprehensive tracking
  const [matchState, setMatchState] = useState({
    // Current innings info
    currentInnings: 1,
    battingTeamId: null,
    bowlingTeamId: null,
    
    // Score tracking
    totalRuns: 0,
    totalWickets: 0,
    totalOvers: 0,
    totalBalls: 0,
    extras: { wides: 0, noBalls: 0, byes: 0, legByes: 0, total: 0 },
    
    // Current over
    currentOver: 0,
    currentBall: 0,
    thisOverBalls: [],
    
    // Players on field
    striker: null,
    nonStriker: null,
    bowler: null,
    
    // Batting scorecard
    battingCard: [], // { player, runs, balls, fours, sixes, isOut, dismissal, strikeRate }
    
    // Bowling scorecard
    bowlingCard: [], // { player, overs, maidens, runs, wickets, economy, balls }
    
    // Fall of wickets
    fallOfWickets: [], // { wicket, runs, overs, batsman }
    
    // Used players tracking
    usedBatsmen: [],
    usedBowlers: [],
    
    // Previous over bowler (can't bowl consecutive)
    lastOverBowler: null,
    
    // Target (for 2nd innings)
    target: null,
    
    // First innings score
    firstInningsScore: null
  })
  
  // Modals state
  const [showNewBatsmanModal, setShowNewBatsmanModal] = useState(false)
  const [showChangeBowlerModal, setShowChangeBowlerModal] = useState(false)
  const [showRetireBatsmanModal, setShowRetireBatsmanModal] = useState(false)
  const [retiringBatsman, setRetiringBatsman] = useState(null) // 'striker' or 'nonStriker'
  const [showWicketModal, setShowWicketModal] = useState(false)
  const [showExtrasModal, setShowExtrasModal] = useState(false)
  const [showEndInningsModal, setShowEndInningsModal] = useState(false)
  const [showScorecardModal, setShowScorecardModal] = useState(false)
  const [showUndoModal, setShowUndoModal] = useState(false)
  
  // Pending ball for wicket/extras selection
  const [pendingBall, setPendingBall] = useState(null)
  const [selectedWicketType, setSelectedWicketType] = useState(null)
  const [selectedFielder, setSelectedFielder] = useState(null)
  const [extraRuns, setExtraRuns] = useState(1)
  
  // Ball history for undo
  const [ballHistory, setBallHistory] = useState([])

  // ==================== STATE PERSISTENCE ====================
  // Save scoring state to server periodically and on changes
  const saveScoringStateToServer = useCallback(async () => {
    if (!selectedMatch?._id || scoringPhase !== 'scoring') return
    
    try {
      const stateToSave = {
        matchState,
        setupData,
        scoringPhase,
        ballHistory: ballHistory.slice(-10) // Keep last 10 for undo
      }
      
      await matchesApi.saveScoringState(selectedMatch._id, stateToSave)
      console.log('[Scoring] State saved to server')
    } catch (error) {
      console.error('[Scoring] Failed to save state:', error)
    }
  }, [selectedMatch?._id, matchState, setupData, scoringPhase, ballHistory])

  // Auto-save scoring state every 30 seconds
  useEffect(() => {
    if (scoringPhase !== 'scoring' || !selectedMatch?._id) return
    
    const saveInterval = setInterval(() => {
      saveScoringStateToServer()
    }, 30000) // Save every 30 seconds
    
    return () => clearInterval(saveInterval)
  }, [scoringPhase, selectedMatch?._id, saveScoringStateToServer])

  // Save state when it changes significantly (after each ball)
  useEffect(() => {
    if (scoringPhase === 'scoring' && matchState.totalBalls > 0) {
      // Debounce the save
      const timeout = setTimeout(() => {
        saveScoringStateToServer()
      }, 2000) // Wait 2 seconds after last change
      
      return () => clearTimeout(timeout)
    }
  }, [matchState.totalBalls, matchState.totalWickets, scoringPhase, saveScoringStateToServer])

  // Restore scoring state when selecting a live match
  const restoreScoringState = useCallback(async (match) => {
    if (!match?._id) return null
    
    setIsRestoring(true)
    try {
      const result = await matchesApi.getScoringState(match._id)
      
      if (result.success && result.data?.scoringState) {
        const saved = result.data.scoringState
        console.log('[Scoring] Restoring saved state from:', saved.savedAt)
        
        // Restore the state
        if (saved.matchState) setMatchState(saved.matchState)
        if (saved.setupData) setSetupData(saved.setupData)
        if (saved.ballHistory) setBallHistory(saved.ballHistory)
        
        return saved.scoringPhase || 'scoring'
      } else if (result.data?.match && result.data.match.status === 'live') {
        // No saved state, but match is live - restore from DB
        const matchData = result.data.match
        const liveData = result.data.liveData
        
        if (matchData.innings?.length > 0 && liveData) {
          console.log('[Scoring] Restoring from database match state')
          
          const currentInningsData = matchData.innings[matchData.currentInnings - 1]
          if (currentInningsData) {
            // Rebuild match state from database
            const restoredState = {
              currentInnings: matchData.currentInnings,
              battingTeamId: currentInningsData.battingTeam,
              bowlingTeamId: currentInningsData.bowlingTeam,
              totalRuns: currentInningsData.runs || 0,
              totalWickets: currentInningsData.wickets || 0,
              totalOvers: Math.floor(currentInningsData.overs || 0),
              totalBalls: Math.round(((currentInningsData.overs || 0) % 1) * 10) + Math.floor(currentInningsData.overs || 0) * 6,
              extras: { wides: 0, noBalls: 0, byes: 0, legByes: 0, total: 0 },
              currentOver: Math.floor(currentInningsData.overs || 0),
              currentBall: Math.round(((currentInningsData.overs || 0) % 1) * 10),
              thisOverBalls: currentInningsData.recentBalls?.slice(-6) || [],
              striker: currentInningsData.currentBatsmen?.find(b => b.onStrike) || null,
              nonStriker: currentInningsData.currentBatsmen?.find(b => !b.onStrike) || null,
              bowler: currentInningsData.currentBowler || null,
              battingCard: currentInningsData.batting || [],
              bowlingCard: currentInningsData.bowling || [],
              fallOfWickets: [],
              usedBatsmen: currentInningsData.batting?.map(b => b.player) || [],
              usedBowlers: currentInningsData.bowling?.map(b => b.player) || [],
              lastOverBowler: null,
              target: matchData.currentInnings === 2 ? (matchData.innings[0]?.runs || 0) + 1 : null,
              firstInningsScore: matchData.currentInnings === 2 ? matchData.innings[0] : null
            }
            
            setMatchState(restoredState)
            setSetupData({
              tossWinner: matchData.toss?.winner,
              tossDecision: matchData.toss?.decision || 'bat',
              striker: restoredState.striker,
              nonStriker: restoredState.nonStriker,
              bowler: restoredState.bowler
            })
            
            return 'scoring'
          }
        }
      }
      
      return null
    } catch (error) {
      console.error('[Scoring] Failed to restore state:', error)
      return null
    } finally {
      setIsRestoring(false)
    }
  }, [])

  // Fetch matches
  const { data: matchesData, isLoading } = useQuery({
    queryKey: ['admin-live-matches'],
    queryFn: matchesApi.getLiveMatches,
    refetchInterval: 5000
  })

  const { data: allMatchesData } = useQuery({
    queryKey: ['admin-all-matches'],
    queryFn: matchesApi.getAllMatches
  })

  // Fetch team players - handle both _id and id formats
  const teamAId = selectedMatch?.teamA?._id || selectedMatch?.teamA?.id
  const teamBId = selectedMatch?.teamB?._id || selectedMatch?.teamB?.id

  const { data: teamAPlayers, isLoading: loadingTeamA } = useQuery({
    queryKey: ['team-players', teamAId],
    queryFn: () => playersApi.getPlayersByTeam(teamAId),
    enabled: !!teamAId
  })

  const { data: teamBPlayers, isLoading: loadingTeamB } = useQuery({
    queryKey: ['team-players', teamBId],
    queryFn: () => playersApi.getPlayersByTeam(teamBId),
    enabled: !!teamBId
  })

  const liveMatches = matchesData?.data || []
  const allMatches = allMatchesData?.data || []
  const scheduledMatches = allMatches.filter(m => m.status === 'scheduled')
  const playersTeamA = teamAPlayers?.data || []
  const playersTeamB = teamBPlayers?.data || []

  // Debug: Log player data (only in development)
  if (import.meta.env.DEV) {
    console.log('=== SCORING DEBUG ===')
    console.log('Selected Match ID:', selectedMatch?._id || selectedMatch?.id)
    console.log('Team A:', teamAId, selectedMatch?.teamA?.shortName)
    console.log('Team B:', teamBId, selectedMatch?.teamB?.shortName)
    console.log('Players Team A count:', playersTeamA.length)
    console.log('Players Team B count:', playersTeamB.length)
    console.log('Toss Winner:', setupData.tossWinner)
    console.log('Toss Decision:', setupData.tossDecision)
    console.log('Loading A:', loadingTeamA, 'Loading B:', loadingTeamB)
  }

  // Helper functions - use the already defined teamAId and teamBId
  const getBattingTeamFromToss = () => {
    if (!selectedMatch || !setupData.tossWinner) {
      console.log('getBattingTeamFromToss: No match or toss winner')
      return null
    }
    
    // Check if toss winner matches team A
    const isTeamATossWinner = setupData.tossWinner === teamAId
    console.log('Is Team A toss winner:', isTeamATossWinner, 'tossWinner:', setupData.tossWinner, 'teamAId:', teamAId)
    
    if (setupData.tossDecision === 'bat') {
      return isTeamATossWinner ? 'A' : 'B'
    } else {
      return isTeamATossWinner ? 'B' : 'A'
    }
  }

  const getBattingTeamPlayers = () => {
    // For setup phase in 2nd innings, use the swapped teams from matchState
    if (scoringPhase === 'setup' && matchState.currentInnings === 2) {
      return matchState.battingTeamId === teamAId ? playersTeamA : playersTeamB
    }
    
    // For setup phase in 1st innings, determine based on toss
    if (scoringPhase === 'setup') {
      const battingTeam = getBattingTeamFromToss()
      console.log('getBattingTeamPlayers - battingTeam:', battingTeam)
      
      if (!battingTeam) {
        console.log('No batting team yet - returning empty')
        return []
      }
      
      const players = battingTeam === 'A' ? playersTeamA : playersTeamB
      console.log('Returning batting team players:', players.length)
      return players
    }
    
    // For scoring phase, use matchState
    return matchState.battingTeamId === teamAId ? playersTeamA : playersTeamB
  }

  const getBowlingTeamPlayers = () => {
    // For setup phase in 2nd innings, use the swapped teams from matchState
    if (scoringPhase === 'setup' && matchState.currentInnings === 2) {
      return matchState.bowlingTeamId === teamAId ? playersTeamA : playersTeamB
    }
    
    // For setup phase in 1st innings, determine based on toss (opposite of batting)
    if (scoringPhase === 'setup') {
      const battingTeam = getBattingTeamFromToss()
      console.log('getBowlingTeamPlayers - battingTeam:', battingTeam)
      
      if (!battingTeam) {
        console.log('No batting team yet - returning empty')
        return []
      }
      
      const players = battingTeam === 'A' ? playersTeamB : playersTeamA
      console.log('Returning bowling team players:', players.length)
      return players
    }
    
    // For scoring phase, use matchState
    return matchState.bowlingTeamId === teamAId ? playersTeamA : playersTeamB
  }

  const getBattingTeamInfo = () => {
    if (matchState.battingTeamId === selectedMatch?.teamA?._id) {
      return selectedMatch?.teamA
    }
    return selectedMatch?.teamB
  }

  const getBowlingTeamInfo = () => {
    if (matchState.bowlingTeamId === selectedMatch?.teamA?._id) {
      return selectedMatch?.teamA
    }
    return selectedMatch?.teamB
  }

  const getRunRate = () => {
    if (matchState.totalOvers === 0 && matchState.currentBall === 0) return '0.00'
    const overs = matchState.currentOver + (matchState.currentBall / 6)
    return overs > 0 ? (matchState.totalRuns / overs).toFixed(2) : '0.00'
  }

  const getRequiredRunRate = () => {
    if (!matchState.target || matchState.currentInnings !== 2) return null
    const runsNeeded = matchState.target - matchState.totalRuns
    const ballsRemaining = (selectedMatch?.overs * 6) - (matchState.currentOver * 6 + matchState.currentBall)
    const oversRemaining = ballsRemaining / 6
    return oversRemaining > 0 ? (runsNeeded / oversRemaining).toFixed(2) : '∞'
  }

  const formatOvers = (overs, balls) => {
    return `${overs}.${balls}`
  }

  // Calculate batsman strike rate
  const getStrikeRate = (runs, balls) => {
    return balls > 0 ? ((runs / balls) * 100).toFixed(1) : '0.0'
  }

  // Calculate bowler economy
  const getEconomy = (runs, balls) => {
    const overs = balls / 6
    return overs > 0 ? (runs / overs).toFixed(2) : '0.00'
  }

  // Update batsman stats in scorecard
  const updateBatsmanStats = (playerId, updates) => {
    setMatchState(prev => ({
      ...prev,
      battingCard: prev.battingCard.map(b => 
        getPlayerId(b.player) === playerId ? { ...b, ...updates } : b
      )
    }))
  }

  // Update bowler stats in scorecard
  const updateBowlerStats = (playerId, updates) => {
    setMatchState(prev => ({
      ...prev,
      bowlingCard: prev.bowlingCard.map(b => 
        getPlayerId(b.player) === playerId ? { ...b, ...updates } : b
      )
    }))
  }

  // Get available batsmen (not yet batted or not out)
  const getAvailableBatsmen = () => {
    return getBattingTeamPlayers().filter(p => 
      !matchState.usedBatsmen.includes(getPlayerId(p))
    )
  }

  // Get available bowlers (not last over bowler)
  const getAvailableBowlers = () => {
    return getBowlingTeamPlayers().filter(p => 
      getPlayerId(p) !== getPlayerId(matchState.lastOverBowler)
    )
  }

  // ==================== START INNINGS ====================
  const handleStartInnings = async () => {
    if (!selectedMatch || !setupData.striker || !setupData.nonStriker || !setupData.bowler) {
      toast.error('Please select all players')
      return
    }

    setIsSubmitting(true)
    try {
      // For 2nd innings, use the already swapped teams from matchState
      // For 1st innings, determine from toss
      let battingTeamId, bowlingTeamId
      const isSecondInnings = matchState.currentInnings === 2

      if (isSecondInnings) {
        // Use the swapped teams from end of first innings
        battingTeamId = matchState.battingTeamId
        bowlingTeamId = matchState.bowlingTeamId
      } else {
        // First innings - determine from toss
        const battingTeam = getBattingTeamFromToss()
        battingTeamId = battingTeam === 'A' ? selectedMatch.teamA?._id : selectedMatch.teamB?._id
        bowlingTeamId = battingTeam === 'A' ? selectedMatch.teamB?._id : selectedMatch.teamA?._id
      }

      // Call API to start innings
      await matchesApi.startInnings(selectedMatch._id, {
        toss: { winner: setupData.tossWinner, decision: setupData.tossDecision },
        battingTeamId,
        bowlingTeamId,
        openers: [setupData.striker, setupData.nonStriker],
        bowler: setupData.bowler,
        innings: isSecondInnings ? 2 : 1
      })

      // Preserve target and firstInningsScore for 2nd innings
      const preservedTarget = matchState.target
      const preservedFirstInningsScore = matchState.firstInningsScore

      // Initialize match state
      setMatchState({
        currentInnings: isSecondInnings ? 2 : 1,
        battingTeamId,
        bowlingTeamId,
        totalRuns: 0,
        totalWickets: 0,
        totalOvers: 0,
        totalBalls: 0,
        extras: { wides: 0, noBalls: 0, byes: 0, legByes: 0, total: 0 },
        currentOver: 0,
        currentBall: 0,
        thisOverBalls: [],
        striker: setupData.striker,
        nonStriker: setupData.nonStriker,
        bowler: setupData.bowler,
        battingCard: [
          { player: setupData.striker, runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false, dismissal: null },
          { player: setupData.nonStriker, runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false, dismissal: null }
        ],
        bowlingCard: [
          { player: setupData.bowler, overs: 0, maidens: 0, runs: 0, wickets: 0, balls: 0 }
        ],
        fallOfWickets: [],
        usedBatsmen: [getPlayerId(setupData.striker), getPlayerId(setupData.nonStriker)],
        usedBowlers: [getPlayerId(setupData.bowler)],
        lastOverBowler: null,
        target: isSecondInnings ? preservedTarget : null,
        firstInningsScore: isSecondInnings ? preservedFirstInningsScore : null
      })

      setScoringPhase('scoring')
      queryClient.invalidateQueries(['admin-live-matches'])
      queryClient.invalidateQueries(['admin-all-matches'])
      toast.success(isSecondInnings ? `2nd innings started! Target: ${preservedTarget} 🏏` : 'Match started! Good luck! 🏏')
    } catch (error) {
      toast.error('Failed to start innings: ' + (error?.message || 'Unknown error'))
    } finally {
      setIsSubmitting(false)
    }
  }

  // ==================== RECORD BALL ====================
  const recordBall = async (ballData) => {
    if (!selectedMatch || isSubmitting) return
    setIsSubmitting(true)

    try {
      const { runs = 0, isExtra = false, extraType = null, extraRuns = 0, isWicket = false, dismissal = null } = ballData

      // Helper to get player ID (handles both _id and id)
      const getPlayerId = (player) => player?._id || player?.id

      // Save current state for undo
      setBallHistory(prev => [...prev.slice(-20), { ...matchState }])

      // Calculate total runs for this ball
      const totalBallRuns = runs + extraRuns

      const strikerId = getPlayerId(matchState.striker)
      const nonStrikerId = getPlayerId(matchState.nonStriker)
      const bowlerId = getPlayerId(matchState.bowler)

      // Update striker stats (if runs off bat)
      if (runs > 0 && strikerId) {
        const strikerCard = matchState.battingCard.find(b => getPlayerId(b.player) === strikerId)
        if (strikerCard) {
          updateBatsmanStats(strikerId, {
            runs: strikerCard.runs + runs,
            fours: strikerCard.fours + (runs === 4 ? 1 : 0),
            sixes: strikerCard.sixes + (runs === 6 ? 1 : 0)
          })
        }
      }

      // Update striker balls faced (legal deliveries only, not wides)
      if (!isExtra || (extraType !== 'wide')) {
        const strikerCard = matchState.battingCard.find(b => getPlayerId(b.player) === strikerId)
        if (strikerCard) {
          updateBatsmanStats(strikerId, {
            balls: strikerCard.balls + 1
          })
        }
      }

      // Update bowler stats
      const bowlerCard = matchState.bowlingCard.find(b => getPlayerId(b.player) === bowlerId)
      if (bowlerCard) {
        const newBalls = !isExtra ? bowlerCard.balls + 1 : bowlerCard.balls
        const newRuns = bowlerCard.runs + totalBallRuns
        const newWickets = bowlerCard.wickets + (isWicket ? 1 : 0)
        
        updateBowlerStats(bowlerId, {
          runs: newRuns,
          balls: newBalls,
          wickets: newWickets,
          overs: Math.floor(newBalls / 6)
        })
      }

      // Update extras
      let newExtras = { ...matchState.extras }
      if (isExtra) {
        if (extraType === 'wide') newExtras.wides += extraRuns
        if (extraType === 'noball') newExtras.noBalls += extraRuns
        if (extraType === 'bye') newExtras.byes += extraRuns
        if (extraType === 'legbye') newExtras.legByes += extraRuns
        newExtras.total += extraRuns
      }

      // Ball display for this over
      const ballDisplay = getBallDisplayText(ballData)
      
      // Determine new ball count
      let newCurrentBall = matchState.currentBall
      let newCurrentOver = matchState.currentOver
      let newThisOverBalls = [...matchState.thisOverBalls, ballDisplay]
      let shouldSwapBatsmen = false
      let endOfOver = false

      // Legal delivery increments ball count
      if (!isExtra || (extraType !== 'wide' && extraType !== 'noball')) {
        newCurrentBall = matchState.currentBall + 1
        
        if (newCurrentBall === 6) {
          // End of over
          endOfOver = true
          newCurrentOver = matchState.currentOver + 1
          newCurrentBall = 0
          newThisOverBalls = []
          shouldSwapBatsmen = true // Swap at end of over
        }
      }

      // Swap logic:
      // 1. Swap on odd TOTAL runs (runs off bat + any extras that go to the batting end)
      // 2. Swap at end of over (already set above)
      // 3. For wides/no-balls with runs, count the runs for swap
      // The key insight: we toggle shouldSwapBatsmen if odd runs, which correctly handles:
      //   - Odd runs mid-over: swap once
      //   - Odd runs at end of over: swap for runs, then swap for over end = back to original (correct!)
      //   - Even runs at end of over: only swap for over end
      const runsForSwap = runs + (extraType === 'bye' || extraType === 'legbye' ? extraRuns : 0)
      if (!isWicket && runsForSwap % 2 === 1) {
        shouldSwapBatsmen = !shouldSwapBatsmen // Toggle because we might already swap at over end
      }

      // Calculate new totals
      const newTotalRuns = matchState.totalRuns + totalBallRuns
      const newTotalWickets = matchState.totalWickets + (isWicket ? 1 : 0)
      const newTotalBalls = !isExtra ? matchState.totalBalls + 1 : matchState.totalBalls

      // For server, send the actual ball number being recorded (1-6)
      // If this is an extra, it's the same ball number as current
      // If it's a legal delivery, it's the next ball (current + 1)
      const ballBeingRecorded = isExtra ? 
        (matchState.currentBall === 0 ? 1 : matchState.currentBall) : 
        matchState.currentBall + 1
      const overBeingRecorded = endOfOver ? matchState.currentOver : matchState.currentOver

      // Send to server
      await socketService.sendScoreUpdate(selectedMatch._id, {
        over: overBeingRecorded,
        ball: ballBeingRecorded,
        runs: totalBallRuns,
        runsOffBat: runs,
        extras: extraRuns,
        extraType,
        wicket: isWicket,
        dismissal,
        striker: matchState.striker?.name,
        nonStriker: matchState.nonStriker?.name,
        bowler: matchState.bowler?.name,
        strikerId: strikerId,
        nonStrikerId: nonStrikerId,
        bowlerId: bowlerId,
        battingTeam: matchState.battingTeamId,
        bowlingTeam: matchState.bowlingTeamId
      })

      // Update match state
      setMatchState(prev => {
        let newStriker = prev.striker
        let newNonStriker = prev.nonStriker
        
        if (shouldSwapBatsmen && !isWicket) {
          newStriker = prev.nonStriker
          newNonStriker = prev.striker
        }

        return {
          ...prev,
          totalRuns: newTotalRuns,
          totalWickets: newTotalWickets,
          totalBalls: newTotalBalls,
          currentOver: newCurrentOver,
          currentBall: newCurrentBall,
          thisOverBalls: newThisOverBalls,
          extras: newExtras,
          striker: newStriker,
          nonStriker: newNonStriker,
          lastOverBowler: endOfOver ? prev.bowler : prev.lastOverBowler
        }
      })

      // Handle wicket
      if (isWicket) {
        // Add to fall of wickets
        setMatchState(prev => ({
          ...prev,
          fallOfWickets: [...prev.fallOfWickets, {
            wicket: prev.totalWickets,
            runs: newTotalRuns,
            overs: formatOvers(newCurrentOver, newCurrentBall),
            batsman: prev.striker
          }],
          battingCard: prev.battingCard.map(b => 
            getPlayerId(b.player) === strikerId 
              ? { ...b, isOut: true, dismissal: dismissal }
              : b
          )
        }))

        // Check if innings should end
        if (newTotalWickets >= 10 || (matchState.currentInnings === 2 && newTotalRuns >= matchState.target)) {
          // All out or target achieved
          setTimeout(() => setShowEndInningsModal(true), 500)
        } else {
          // Need new batsman
          setShowNewBatsmanModal(true)
        }
      }

      // Check if overs completed
      if (endOfOver && newCurrentOver >= selectedMatch?.overs) {
        setTimeout(() => setShowEndInningsModal(true), 500)
      } else if (endOfOver && !isWicket) {
        // Need to change bowler
        setShowChangeBowlerModal(true)
      }

      // Check if target achieved in 2nd innings
      if (matchState.currentInnings === 2 && matchState.target && newTotalRuns >= matchState.target) {
        setTimeout(() => handleEndMatch(matchState.battingTeamId, `${getBattingTeamInfo()?.name} won by ${10 - newTotalWickets} wickets`, 'wickets'), 500)
      }

      queryClient.invalidateQueries(['admin-live-matches'])

    } catch (error) {
      toast.error('Failed to record ball: ' + (error?.message || 'Unknown error'))
    } finally {
      setIsSubmitting(false)
    }
  }

  // Ball display text
  const getBallDisplayText = (ballData) => {
    const { runs = 0, isExtra = false, extraType = null, extraRuns = 0, isWicket = false } = ballData
    
    if (isWicket) return 'W'
    if (extraType === 'wide') return extraRuns > 1 ? `${extraRuns}Wd` : 'Wd'
    if (extraType === 'noball') return runs > 0 ? `${runs}+Nb` : 'Nb'
    if (extraType === 'bye') return extraRuns > 1 ? `${extraRuns}B` : 'B'
    if (extraType === 'legbye') return extraRuns > 1 ? `${extraRuns}Lb` : 'Lb'
    return runs.toString()
  }

  // ==================== HANDLE QUICK RUNS ====================
  const handleQuickRun = (runs) => {
    recordBall({ runs, isExtra: false })
  }

  // ==================== HANDLE WIDE ====================
  const handleWide = (additionalRuns = 0) => {
    recordBall({ 
      runs: 0, 
      isExtra: true, 
      extraType: 'wide', 
      extraRuns: 1 + additionalRuns 
    })
  }

  // ==================== HANDLE NO BALL ====================
  const handleNoBall = (runsOffBat = 0) => {
    recordBall({ 
      runs: runsOffBat, 
      isExtra: true, 
      extraType: 'noball', 
      extraRuns: 1 
    })
  }

  // ==================== HANDLE BYE/LEG BYE ====================
  const handleBye = (runs = 1) => {
    recordBall({ runs: 0, isExtra: true, extraType: 'bye', extraRuns: runs })
  }

  const handleLegBye = (runs = 1) => {
    recordBall({ runs: 0, isExtra: true, extraType: 'legbye', extraRuns: runs })
  }

  // ==================== HANDLE WICKET ====================
  const handleWicket = (type, fielder = null, runsBeforeWicket = 0) => {
    const dismissalText = getDismissalText(type, fielder, matchState.bowler)
    recordBall({ 
      runs: runsBeforeWicket, 
      isWicket: true, 
      dismissal: { type, fielder, text: dismissalText }
    })
    setShowWicketModal(false)
    setSelectedWicketType(null)
    setSelectedFielder(null)
  }

  const getDismissalText = (type, fielder, bowler) => {
    switch (type) {
      case 'bowled': return `b ${bowler?.name}`
      case 'caught': return fielder ? `c ${fielder.name} b ${bowler?.name}` : `c & b ${bowler?.name}`
      case 'lbw': return `lbw b ${bowler?.name}`
      case 'stumped': return `st ${fielder?.name || '†'} b ${bowler?.name}`
      case 'runout': return `run out (${fielder?.name || 'direct'})`
      case 'hitwicket': return `hit wicket b ${bowler?.name}`
      default: return type
    }
  }

  // ==================== NEW BATSMAN ====================
  const handleNewBatsman = async (player) => {
    try {
      await matchesApi.newBatsman(selectedMatch._id, {
        batsman: player,
        outBatsman: matchState.striker
      })

      const playerId = getPlayerId(player)
      setMatchState(prev => ({
        ...prev,
        striker: player,
        usedBatsmen: [...prev.usedBatsmen, playerId],
        battingCard: [...prev.battingCard, {
          player,
          runs: 0,
          balls: 0,
          fours: 0,
          sixes: 0,
          isOut: false,
          dismissal: null
        }]
      }))

      setShowNewBatsmanModal(false)
      queryClient.invalidateQueries(['admin-live-matches'])
      toast.success(`${player.name} is now batting`)
    } catch (error) {
      toast.error('Failed to add batsman: ' + (error?.message || 'Unknown error'))
    }
  }

  // ==================== CHANGE BOWLER ====================
  const handleChangeBowler = async (player) => {
    try {
      await matchesApi.changeBowler(selectedMatch._id, {
        bowler: player,
        previousBowlerStats: matchState.bowler
      })

      const playerId = getPlayerId(player)
      // Check if bowler already in bowling card
      const existingBowler = matchState.bowlingCard.find(b => getPlayerId(b.player) === playerId)

      setMatchState(prev => ({
        ...prev,
        bowler: player,
        usedBowlers: prev.usedBowlers.includes(playerId) 
          ? prev.usedBowlers 
          : [...prev.usedBowlers, playerId],
        bowlingCard: existingBowler 
          ? prev.bowlingCard 
          : [...prev.bowlingCard, { player, overs: 0, maidens: 0, runs: 0, wickets: 0, balls: 0 }]
      }))

      setShowChangeBowlerModal(false)
      queryClient.invalidateQueries(['admin-live-matches'])
      toast.success(`${player.name} is now bowling`)
    } catch (error) {
      toast.error('Failed to change bowler: ' + (error?.message || 'Unknown error'))
    }
  }

  // ==================== SWAP BATSMEN MANUALLY ====================
  const handleSwapBatsmen = () => {
    setMatchState(prev => ({
      ...prev,
      striker: prev.nonStriker,
      nonStriker: prev.striker
    }))
    toast.success('Batsmen swapped')
  }

  // ==================== RETIRE BATSMAN ====================
  const handleRetireBatsman = (position) => {
    setRetiringBatsman(position) // 'striker' or 'nonStriker'
    setShowRetireBatsmanModal(true)
  }

  const handleSelectReplacementBatsman = async (player) => {
    try {
      const retiringPlayer = retiringBatsman === 'striker' ? matchState.striker : matchState.nonStriker
      const retiringPlayerId = getPlayerId(retiringPlayer)
      const newPlayerId = getPlayerId(player)
      
      // Mark the retiring batsman as retired hurt in the batting card
      setMatchState(prev => {
        const newBattingCard = prev.battingCard.map(b => 
          getPlayerId(b.player) === retiringPlayerId 
            ? { ...b, isOut: true, dismissal: { type: 'retired', text: 'retired hurt' } }
            : b
        )
        
        // Add the new batsman if not already in the card
        const alreadyInCard = newBattingCard.some(b => getPlayerId(b.player) === newPlayerId)
        if (!alreadyInCard) {
          newBattingCard.push({
            player,
            runs: 0,
            balls: 0,
            fours: 0,
            sixes: 0,
            isOut: false,
            dismissal: null
          })
        }

        return {
          ...prev,
          [retiringBatsman]: player,
          battingCard: newBattingCard,
          usedBatsmen: prev.usedBatsmen.includes(newPlayerId) 
            ? prev.usedBatsmen 
            : [...prev.usedBatsmen, newPlayerId]
        }
      })

      setShowRetireBatsmanModal(false)
      setRetiringBatsman(null)
      toast.success(`${retiringPlayer?.name} retired. ${player.name} is now batting.`)
    } catch (error) {
      toast.error('Failed to replace batsman: ' + (error?.message || 'Unknown error'))
    }
  }

  // ==================== UNDO LAST BALL ====================
  const handleUndo = () => {
    if (ballHistory.length === 0) {
      toast.error('No balls to undo')
      return
    }
    
    const previousState = ballHistory[ballHistory.length - 1]
    setMatchState(previousState)
    setBallHistory(prev => prev.slice(0, -1))
    toast.success('Last ball undone')
    setShowUndoModal(false)
  }

  // ==================== END INNINGS ====================
  const handleEndInnings = async () => {
    setIsSubmitting(true)
    
    try {
      // Prepare innings data to save to database
      const inningsData = {
        totalRuns: matchState.totalRuns,
        totalWickets: matchState.totalWickets,
        overs: matchState.currentOver + (matchState.currentBall / 10),
        runRate: getRunRate(),
        battingCard: matchState.battingCard,
        bowlingCard: matchState.bowlingCard,
        fallOfWickets: matchState.fallOfWickets,
        extras: matchState.extras
      }

      // Call API to save innings data and update player stats
      await matchesApi.endInnings(selectedMatch._id, inningsData, matchState.currentInnings)


      // Refetch all players, teams, and match to update stats and run rate in UI and viewer
      if (queryClient) {
        queryClient.invalidateQueries(['player'])
        queryClient.invalidateQueries(['players'])
        queryClient.invalidateQueries(['team'])
        queryClient.invalidateQueries(['match'])
        queryClient.invalidateQueries(['admin-live-matches'])
      }

      if (matchState.currentInnings === 1) {
        // Set target for 2nd innings
        const firstInningsScore = {
          runs: matchState.totalRuns,
          wickets: matchState.totalWickets,
          overs: formatOvers(matchState.currentOver, matchState.currentBall)
        }
        // Swap teams
        const newBattingTeamId = matchState.bowlingTeamId
        const newBowlingTeamId = matchState.battingTeamId
        setMatchState(prev => ({
          ...prev,
          currentInnings: 2,
          battingTeamId: newBattingTeamId,
          bowlingTeamId: newBowlingTeamId,
          totalRuns: 0,
          totalWickets: 0,
          totalBalls: 0,
          currentOver: 0,
          currentBall: 0,
          thisOverBalls: [],
          extras: { wides: 0, noBalls: 0, byes: 0, legByes: 0, total: 0 },
          striker: null,
          nonStriker: null,
          bowler: null,
          battingCard: [],
          bowlingCard: [],
          fallOfWickets: [],
          usedBatsmen: [],
          usedBowlers: [],
          lastOverBowler: null,
          target: firstInningsScore.runs + 1,
          firstInningsScore
        }))
        
        setShowEndInningsModal(false)
        
        // Reset setup data for 2nd innings
        setSetupData({
          tossWinner: setupData.tossWinner,
          tossDecision: setupData.tossDecision,
          striker: null,
          nonStriker: null,
          bowler: null
        })
        
        // Invalidate queries to refresh player stats
        queryClient.invalidateQueries(['players'])
        
        setScoringPhase('setup')
        toast.success(`First innings: ${firstInningsScore.runs}/${firstInningsScore.wickets}. Target: ${firstInningsScore.runs + 1}. Player stats updated!`)
      } else {
        // Match over - determine result
        const runsNeeded = matchState.target - matchState.totalRuns
        let result = ''
        let winnerId = null
        let resultType = null
        
        if (matchState.totalRuns >= matchState.target) {
          winnerId = matchState.battingTeamId
          result = `${getBattingTeamInfo()?.name} won by ${10 - matchState.totalWickets} wickets`
          resultType = 'wickets'
        } else {
          winnerId = matchState.bowlingTeamId
          result = `${getBowlingTeamInfo()?.name} won by ${runsNeeded - 1} runs`
          resultType = 'runs'
        }
        
        await handleEndMatch(winnerId, result, resultType)
      }
    } catch (error) {
      console.error('Failed to end innings:', error)
      toast.error('Failed to end innings: ' + (error?.message || 'Unknown error'))
    } finally {
      setIsSubmitting(false)
    }
  }

  // ==================== END MATCH ====================
  const handleEndMatch = async (winnerId, result, resultType = null) => {
    try {
      // Use completeMatch API which updates stats and clears cache
      await matchesApi.completeMatch(selectedMatch._id, {
        winner: winnerId,
        result,
        resultType  // 'runs' or 'wickets' - helps auto-generate result text
      })
      
      queryClient.invalidateQueries(['admin-live-matches'])
      queryClient.invalidateQueries(['admin-all-matches'])
      queryClient.invalidateQueries(['teams'])  // Refresh team standings
      queryClient.invalidateQueries(['players'])  // Refresh player stats
      
      setSelectedMatch(null)
      setScoringPhase('select')
      setShowEndInningsModal(false)
      
      toast.success(`Match completed! ${result}`)
    } catch (error) {
      toast.error('Failed to end match: ' + (error?.message || 'Unknown error'))
    }
  }

  // ==================== RENDER: SELECT MATCH ====================
  if (scoringPhase === 'select') {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-epic font-bold text-2xl">Live Scoring</h2>
            <p className="text-base-content/60">Professional cricket scoring system</p>
          </div>
          <button 
            onClick={() => queryClient.invalidateQueries(['admin-live-matches', 'admin-all-matches'])}
            className="btn btn-ghost btn-sm gap-2"
          >
            <HiArrowPath className="w-4 h-4" /> Refresh
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : (
          <>
            {/* Live Matches */}
            {liveMatches.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  Live Matches - Continue Scoring
                </h3>
                <div className="grid gap-4">
                  {liveMatches.map((match) => (
                    <motion.div
                      key={match._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-base-100 rounded-xl border-2 border-red-500/30 p-6 cursor-pointer hover:shadow-lg transition-all hover:scale-[1.01]"
                      onClick={async () => {
                        setSelectedMatch(match)
                        setIsRestoring(true)
                        
                        // Try to restore saved scoring state first
                        const restoredPhase = await restoreScoringState(match)
                        
                        if (restoredPhase === 'scoring') {
                          setScoringPhase('scoring')
                          toast.success('Resumed scoring from last saved state')
                        } else {
                          // Fallback: Resume from basic match state
                          const innings = match.innings?.[match.currentInnings - 1]
                          if (innings?.currentBatsmen?.length > 0 && innings?.currentBowler) {
                            setMatchState({
                              currentInnings: match.currentInnings || 1,
                              battingTeamId: innings?.battingTeam || match.teamA?._id,
                              bowlingTeamId: innings?.bowlingTeam || match.teamB?._id,
                              totalRuns: match.score?.runs || innings?.runs || 0,
                              totalWickets: match.score?.wickets || innings?.wickets || 0,
                              totalBalls: Math.round(((match.score?.overs || 0) % 1) * 10) + Math.floor(match.score?.overs || 0) * 6,
                              currentOver: Math.floor(match.score?.overs || 0),
                              currentBall: Math.round(((match.score?.overs || 0) % 1) * 10),
                              thisOverBalls: innings?.recentBalls?.slice(-6) || [],
                              extras: { wides: 0, noBalls: 0, byes: 0, legByes: 0, total: 0 },
                              striker: innings?.currentBatsmen?.find(b => b.onStrike) || innings?.currentBatsmen?.[0] || null,
                              nonStriker: innings?.currentBatsmen?.find(b => !b.onStrike) || innings?.currentBatsmen?.[1] || null,
                              bowler: innings?.currentBowler || null,
                              battingCard: innings?.batting || innings?.currentBatsmen?.map(b => ({ ...b, player: b })) || [],
                              bowlingCard: innings?.bowling || (innings?.currentBowler ? [{ ...innings.currentBowler, player: innings.currentBowler }] : []),
                              fallOfWickets: [],
                              usedBatsmen: innings?.batting?.map(b => b.player?._id || b.player) || [],
                              usedBowlers: innings?.bowling?.map(b => b.player?._id || b.player) || [],
                              lastOverBowler: null,
                              target: match.currentInnings === 2 ? (match.innings?.[0]?.runs || 0) + 1 : null,
                              firstInningsScore: match.currentInnings === 2 ? match.innings?.[0] : null
                            })
                            setScoringPhase('scoring')
                            toast.success('Resumed scoring from match state')
                          } else {
                            // No valid state - need setup
                            setScoringPhase('setup')
                            toast.info('Please set up the current innings')
                          }
                        }
                        
                        setIsRestoring(false)
                      }}
                    >
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-6 flex-wrap">
                          <div className="flex items-center gap-3">
                            <div className="w-14 h-14 rounded-xl bg-white shadow flex items-center justify-center p-1">
                              {match.teamA?.logo ? (
                                <img src={match.teamA.logo} alt="" className="w-full h-full object-contain" />
                              ) : (
                                <span className="font-bold text-lg">{match.teamA?.shortName?.[0]}</span>
                              )}
                            </div>
                            <span className="font-bold text-lg">{match.teamA?.shortName}</span>
                          </div>
                          
                          <div className="text-center">
                            <span className="badge badge-error gap-1 mb-2">
                              <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span> LIVE
                            </span>
                            <p className="text-3xl font-bold">{match.score?.runs || 0}/{match.score?.wickets || 0}</p>
                            <p className="text-sm text-base-content/60">({match.score?.overs || 0} overs)</p>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-lg">{match.teamB?.shortName}</span>
                            <div className="w-14 h-14 rounded-xl bg-white shadow flex items-center justify-center p-1">
                              {match.teamB?.logo ? (
                                <img src={match.teamB.logo} alt="" className="w-full h-full object-contain" />
                              ) : (
                                <span className="font-bold text-lg">{match.teamB?.shortName?.[0]}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <button className="btn btn-primary btn-lg gap-2" disabled={isRestoring}>
                          {isRestoring ? (
                            <>
                              <span className="loading loading-spinner"></span> Restoring...
                            </>
                          ) : (
                            <>
                              <HiPlayCircle className="w-6 h-6" /> Continue Scoring
                            </>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Scheduled Matches */}
            {scheduledMatches.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Scheduled Matches - Start New</h3>
                <div className="grid gap-4">
                  {scheduledMatches.map((match) => (
                    <motion.div
                      key={match._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-base-100 rounded-xl border border-base-200 p-6 cursor-pointer hover:shadow-lg transition-all hover:scale-[1.01]"
                      onClick={() => {
                        setSelectedMatch(match)
                        setSetupData({
                          tossWinner: '',
                          tossDecision: 'bat',
                          striker: null,
                          nonStriker: null,
                          bowler: null
                        })
                        setScoringPhase('setup')
                      }}
                    >
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-6 flex-wrap">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-white shadow flex items-center justify-center p-1">
                              {match.teamA?.logo ? (
                                <img src={match.teamA.logo} alt="" className="w-full h-full object-contain" />
                              ) : (
                                <span className="font-bold">{match.teamA?.shortName?.[0]}</span>
                              )}
                            </div>
                            <div>
                              <p className="font-bold">{match.teamA?.shortName}</p>
                              <p className="text-xs text-base-content/60">{match.teamA?.name}</p>
                            </div>
                          </div>
                          
                          <span className="text-2xl font-bold text-base-content/20">VS</span>
                          
                          <div className="flex items-center gap-3">
                            <div>
                              <p className="font-bold">{match.teamB?.shortName}</p>
                              <p className="text-xs text-base-content/60">{match.teamB?.name}</p>
                            </div>
                            <div className="w-12 h-12 rounded-lg bg-white shadow flex items-center justify-center p-1">
                              {match.teamB?.logo ? (
                                <img src={match.teamB.logo} alt="" className="w-full h-full object-contain" />
                              ) : (
                                <span className="font-bold">{match.teamB?.shortName?.[0]}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-sm text-base-content/60 mb-2">
                            {new Date(match.scheduledAt).toLocaleDateString('en-US', { 
                              weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                            })}
                          </p>
                          <button className="btn btn-success gap-2">
                            <HiPlay className="w-5 h-5" /> Start Match
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {liveMatches.length === 0 && scheduledMatches.length === 0 && (
              <div className="text-center py-16 bg-base-100 rounded-2xl border border-base-200">
                <HiPlayCircle className="w-20 h-20 mx-auto text-base-content/10 mb-4" />
                <h3 className="font-semibold text-xl mb-2">No Matches Available</h3>
                <p className="text-base-content/60 mb-6">Schedule a new match from the Matches tab to start scoring</p>
              </div>
            )}
          </>
        )}
      </div>
    )
  }

  // ==================== RENDER: MATCH SETUP ====================
  if (scoringPhase === 'setup') {
    // For 2nd innings, use the swapped teams from matchState
    // For 1st innings, determine from toss
    let battingTeamInfo, bowlingTeamInfo
    
    if (matchState.currentInnings === 2) {
      battingTeamInfo = matchState.battingTeamId === selectedMatch?.teamA?._id 
        ? selectedMatch?.teamA 
        : selectedMatch?.teamB
      bowlingTeamInfo = matchState.bowlingTeamId === selectedMatch?.teamA?._id 
        ? selectedMatch?.teamA 
        : selectedMatch?.teamB
    } else {
      const battingTeam = getBattingTeamFromToss()
      battingTeamInfo = battingTeam === 'A' ? selectedMatch?.teamA : selectedMatch?.teamB
      bowlingTeamInfo = battingTeam === 'A' ? selectedMatch?.teamB : selectedMatch?.teamA
    }

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              setSelectedMatch(null)
              setScoringPhase('select')
            }}
            className="btn btn-ghost btn-circle"
          >
            <HiArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h2 className="font-epic font-bold text-2xl">
              {matchState.currentInnings === 2 ? '2nd Innings Setup' : 'Match Setup'}
            </h2>
            <p className="text-base-content/60">
              {selectedMatch?.teamA?.shortName} vs {selectedMatch?.teamB?.shortName}
              {matchState.target && ` • Target: ${matchState.target} runs`}
            </p>
          </div>
        </div>

        {/* Target Display for 2nd Innings */}
        {matchState.target && matchState.firstInningsScore && (
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-4 text-white">
            <p className="text-sm opacity-80">First Innings</p>
            <p className="text-2xl font-bold">
              {matchState.firstInningsScore.runs}/{matchState.firstInningsScore.wickets} 
              <span className="text-lg font-normal ml-2">({matchState.firstInningsScore.overs} overs)</span>
            </p>
            <p className="mt-2 text-lg">Target: <span className="font-bold">{matchState.target} runs</span></p>
          </div>
        )}

        {/* Toss - Only for 1st innings */}
        {matchState.currentInnings !== 2 && (
          <div className="bg-base-100 rounded-xl border border-base-200 p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <HiTrophy className="w-5 h-5 text-yellow-500" /> Toss
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="form-control">
                <label className="label"><span className="label-text font-medium">Who won the toss?</span></label>
                <div className="grid grid-cols-2 gap-3">
                  {[selectedMatch?.teamA, selectedMatch?.teamB].map((team) => {
                    const teamId = team?._id || team?.id
                    return (
                      <button
                        key={teamId}
                        type="button"
                        onClick={() => setSetupData(prev => ({ ...prev, tossWinner: teamId, striker: null, nonStriker: null, bowler: null }))}
                        className={`btn h-auto py-4 flex-col gap-2 ${setupData.tossWinner === teamId ? 'btn-primary' : 'btn-outline'}`}
                      >
                        {team?.logo && (
                          <img src={team.logo} alt="" className="w-10 h-10 rounded object-contain bg-white p-1" />
                        )}
                        <span className="font-bold">{team?.shortName}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="form-control">
                <label className="label"><span className="label-text font-medium">Elected to?</span></label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSetupData(prev => ({ ...prev, tossDecision: 'bat', striker: null, nonStriker: null, bowler: null }))}
                    className={`btn btn-lg ${setupData.tossDecision === 'bat' ? 'btn-primary' : 'btn-outline'}`}
                  >
                    🏏 Bat First
                  </button>
                  <button
                    type="button"
                    onClick={() => setSetupData(prev => ({ ...prev, tossDecision: 'bowl', striker: null, nonStriker: null, bowler: null }))}
                    className={`btn btn-lg ${setupData.tossDecision === 'bowl' ? 'btn-primary' : 'btn-outline'}`}
                  >
                    ⚾ Bowl First
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Opening Batsmen */}
        {(setupData.tossWinner || matchState.currentInnings === 2) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-base-100 rounded-xl border border-base-200 p-6"
          >
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <HiUsers className="w-5 h-5 text-blue-500" /> 
              Opening Batsmen 
              <span className="badge badge-primary">{battingTeamInfo?.shortName || getBattingTeamInfo()?.shortName}</span>
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Striker (Facing First Ball) *</span>
                </label>
                {(loadingTeamA || loadingTeamB) ? (
                  <div className="flex items-center gap-2 p-3">
                    <span className="loading loading-spinner loading-sm"></span>
                    <span className="text-sm text-base-content/60">Loading players...</span>
                  </div>
                ) : (
                  <select
                    value={setupData.striker?._id || setupData.striker?.id || ''}
                    onChange={(e) => {
                      const player = getBattingTeamPlayers().find(p => (p._id || p.id) === e.target.value)
                      setSetupData(prev => ({ ...prev, striker: player }))
                    }}
                    className="select select-bordered w-full"
                  >
                    <option value="">Select Striker</option>
                    {getBattingTeamPlayers()
                      .filter(p => (p._id || p.id) !== (setupData.nonStriker?._id || setupData.nonStriker?.id))
                      .map(player => {
                        const playerId = player._id || player.id
                        return (
                          <option key={playerId} value={playerId}>
                            #{player.jerseyNumber || '?'} {player.name} • {player.role}
                          </option>
                        )
                      })}
                  </select>
                )}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Non-Striker *</span>
                </label>
                {(loadingTeamA || loadingTeamB) ? (
                  <div className="flex items-center gap-2 p-3">
                    <span className="loading loading-spinner loading-sm"></span>
                    <span className="text-sm text-base-content/60">Loading players...</span>
                  </div>
                ) : (
                  <select
                    value={setupData.nonStriker?._id || setupData.nonStriker?.id || ''}
                    onChange={(e) => {
                      const player = getBattingTeamPlayers().find(p => (p._id || p.id) === e.target.value)
                      setSetupData(prev => ({ ...prev, nonStriker: player }))
                    }}
                    className="select select-bordered w-full"
                  >
                    <option value="">Select Non-Striker</option>
                    {getBattingTeamPlayers()
                      .filter(p => (p._id || p.id) !== (setupData.striker?._id || setupData.striker?.id))
                      .map(player => {
                        const playerId = player._id || player.id
                        return (
                          <option key={playerId} value={playerId}>
                            #{player.jerseyNumber || '?'} {player.name} • {player.role}
                          </option>
                        )
                      })}
                  </select>
                )}
              </div>
            </div>

            {/* Show selected players */}
            {(setupData.striker || setupData.nonStriker) && (
              <div className="mt-4 grid grid-cols-2 gap-3">
                {setupData.striker && (
                  <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg border-2 border-primary/30">
                    <div className="w-12 h-12 rounded-full bg-primary text-primary-content flex items-center justify-center font-bold text-lg">
                      {setupData.striker.jerseyNumber || '*'}
                    </div>
                    <div>
                      <p className="font-semibold">{setupData.striker.name}</p>
                      <p className="text-xs text-base-content/60">Striker • {setupData.striker.battingStyle}</p>
                    </div>
                  </div>
                )}
                {setupData.nonStriker && (
                  <div className="flex items-center gap-3 p-3 bg-base-200 rounded-lg">
                    <div className="w-12 h-12 rounded-full bg-base-300 flex items-center justify-center font-bold text-lg">
                      {setupData.nonStriker.jerseyNumber || '2'}
                    </div>
                    <div>
                      <p className="font-semibold">{setupData.nonStriker.name}</p>
                      <p className="text-xs text-base-content/60">Non-Striker • {setupData.nonStriker.battingStyle}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* Opening Bowler */}
        {(setupData.tossWinner || matchState.currentInnings === 2) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-base-100 rounded-xl border border-base-200 p-6"
          >
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              ⚾ Opening Bowler 
              <span className="badge badge-secondary">{bowlingTeamInfo?.shortName || getBowlingTeamInfo()?.shortName}</span>
            </h3>
            
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Select Bowler *</span>
              </label>
              {(loadingTeamA || loadingTeamB) ? (
                <div className="flex items-center gap-2 p-3">
                  <span className="loading loading-spinner loading-sm"></span>
                  <span className="text-sm text-base-content/60">Loading players...</span>
                </div>
              ) : (
                <select
                  value={setupData.bowler?._id || setupData.bowler?.id || ''}
                  onChange={(e) => {
                    const player = getBowlingTeamPlayers().find(p => (p._id || p.id) === e.target.value)
                    setSetupData(prev => ({ ...prev, bowler: player }))
                  }}
                  className="select select-bordered w-full"
                >
                  <option value="">Select Opening Bowler</option>
                  {getBowlingTeamPlayers().map(player => {
                    const playerId = player._id || player.id
                    return (
                      <option key={playerId} value={playerId}>
                        #{player.jerseyNumber || '?'} {player.name} 
                        {player.bowlingStyle && player.bowlingStyle !== 'None' ? ` • ${player.bowlingStyle}` : ` • ${player.role}`}
                      </option>
                    )
                  })}
                </select>
              )}
            </div>

            {/* Show selected bowler */}
            {setupData.bowler && (
              <div className="mt-4">
                <div className="flex items-center gap-3 p-3 bg-secondary/10 rounded-lg border-2 border-secondary/30">
                  <div className="w-12 h-12 rounded-full bg-secondary text-secondary-content flex items-center justify-center font-bold text-lg">
                    {setupData.bowler.jerseyNumber || '🏏'}
                  </div>
                  <div>
                    <p className="font-semibold">{setupData.bowler.name}</p>
                    <p className="text-xs text-base-content/60">
                      {setupData.bowler.bowlingStyle && setupData.bowler.bowlingStyle !== 'None' 
                        ? setupData.bowler.bowlingStyle 
                        : setupData.bowler.role}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Start Button */}
        <div className="flex justify-between items-center pt-4">
          <button
            onClick={() => {
              setSelectedMatch(null)
              setScoringPhase('select')
            }}
            className="btn btn-ghost"
          >
            Cancel
          </button>
          <button
            onClick={handleStartInnings}
            disabled={!(setupData.tossWinner || matchState.currentInnings === 2) || !setupData.striker || !setupData.nonStriker || !setupData.bowler || isSubmitting}
            className="btn btn-primary btn-lg gap-2 min-w-[200px]"
          >
            {isSubmitting ? (
              <span className="loading loading-spinner"></span>
            ) : (
              <HiPlay className="w-6 h-6" />
            )}
            {matchState.currentInnings === 2 ? 'Start 2nd Innings' : 'Start Match'}
          </button>
        </div>
      </div>
    )
  }

  // ==================== RENDER: SCORING PHASE ====================
  // Professional Live Scoring Interface
  const strikerCard = matchState.battingCard.find(b => b.player?._id === matchState.striker?._id)
  const nonStrikerCard = matchState.battingCard.find(b => b.player?._id === matchState.nonStriker?._id)
  const bowlerCard = matchState.bowlingCard.find(b => b.player?._id === matchState.bowler?._id)

  return (
    <div className="space-y-4">
      {/* Header with Controls */}
      <div className="flex items-center gap-4 flex-wrap">
        <button 
          onClick={() => {
            if (confirm('Leave match scoring? Progress will be saved.')) {
              setSelectedMatch(null)
              setScoringPhase('select')
            }
          }}
          className="btn btn-ghost btn-circle btn-sm"
        >
          <HiArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h2 className="font-epic font-bold text-xl">
            {selectedMatch?.teamA?.shortName} vs {selectedMatch?.teamB?.shortName}
          </h2>
          <p className="text-base-content/60 text-sm">
            {matchState.currentInnings === 2 ? '2nd Innings' : '1st Innings'}
            {selectedMatch?.venue && ` • ${selectedMatch.venue}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowScorecardModal(true)}
            className="btn btn-ghost btn-sm gap-1"
          >
            <HiTableCells className="w-4 h-4" /> Scorecard
          </button>
          <button 
            onClick={() => setShowUndoModal(true)}
            disabled={ballHistory.length === 0}
            className="btn btn-ghost btn-sm gap-1"
          >
            <HiArrowUturnLeft className="w-4 h-4" /> Undo
          </button>
          <span className="badge badge-error gap-1 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-white"></span> LIVE
          </span>
        </div>
      </div>

      {/* Main Score Display */}
      <div className="bg-gradient-to-br from-hpl-maroon via-hpl-maroon/95 to-hpl-navy rounded-2xl p-5 text-white shadow-xl">
        {/* Target Info for 2nd Innings */}
        {matchState.currentInnings === 2 && matchState.target && (
          <div className="bg-white/10 rounded-lg p-3 mb-4 flex items-center justify-between flex-wrap gap-2">
            <div>
              <span className="text-white/70 text-sm">Target: </span>
              <span className="font-bold text-lg">{matchState.target}</span>
            </div>
            <div>
              <span className="text-white/70 text-sm">Need: </span>
              <span className="font-bold text-lg">
                {matchState.target - matchState.totalRuns} from {(selectedMatch?.overs * 6) - (matchState.currentOver * 6 + matchState.currentBall)} balls
              </span>
            </div>
            <div>
              <span className="text-white/70 text-sm">RRR: </span>
              <span className="font-bold text-lg">{getRequiredRunRate()}</span>
            </div>
          </div>
        )}

        {/* Score and Teams */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Batting Team */}
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl bg-white shadow-lg flex items-center justify-center p-1">
              {getBattingTeamInfo()?.logo ? (
                <img src={getBattingTeamInfo().logo} alt="" className="w-full h-full object-contain" />
              ) : (
                <span className="font-bold text-hpl-maroon text-lg">{getBattingTeamInfo()?.shortName?.[0]}</span>
              )}
            </div>
            <div>
              <p className="font-bold text-lg">{getBattingTeamInfo()?.shortName}</p>
              <p className="text-white/60 text-xs">Batting</p>
            </div>
          </div>

          {/* Main Score */}
          <div className="text-center flex-1">
            <p className="text-5xl md:text-6xl font-epic font-bold tracking-tight">
              {matchState.totalRuns}<span className="text-white/60">/</span>{matchState.totalWickets}
            </p>
            <p className="text-white/80 mt-1 text-lg">
              ({formatOvers(matchState.currentOver, matchState.currentBall)} ov) • RR: {getRunRate()}
            </p>
          </div>

          {/* Bowling Team */}
          <div className="flex items-center gap-3">
            <div>
              <p className="font-bold text-lg text-right">{getBowlingTeamInfo()?.shortName}</p>
              <p className="text-white/60 text-xs text-right">Bowling</p>
            </div>
            <div className="w-14 h-14 rounded-xl bg-white/20 shadow flex items-center justify-center p-1">
              {getBowlingTeamInfo()?.logo ? (
                <img src={getBowlingTeamInfo().logo} alt="" className="w-full h-full object-contain" />
              ) : (
                <span className="font-bold text-lg">{getBowlingTeamInfo()?.shortName?.[0]}</span>
              )}
            </div>
          </div>
        </div>

        {/* This Over Display */}
        <div className="mt-4 pt-4 border-t border-white/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60 text-sm font-medium">This Over</span>
            <span className="text-white/60 text-sm">
              Extras: {matchState.extras.total} (Wd {matchState.extras.wides}, Nb {matchState.extras.noBalls}, B {matchState.extras.byes}, Lb {matchState.extras.legByes})
            </span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {matchState.thisOverBalls.map((ball, idx) => (
              <span 
                key={idx} 
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-md ${
                  ball === 'W' ? 'bg-red-500 text-white' : 
                  ball === '4' ? 'bg-blue-500 text-white' : 
                  ball === '6' ? 'bg-green-500 text-white' : 
                  ball.includes('Wd') || ball.includes('Nb') ? 'bg-yellow-400 text-black' :
                  ball.includes('B') || ball.includes('Lb') ? 'bg-purple-400 text-white' :
                  'bg-white/25 text-white'
                }`}
              >
                {ball}
              </span>
            ))}
            {/* Empty ball placeholders */}
            {Array(Math.max(0, 6 - matchState.thisOverBalls.length)).fill(null).map((_, idx) => (
              <span key={`empty-${idx}`} className="w-10 h-10 rounded-full bg-white/10 border border-white/20"></span>
            ))}
          </div>
        </div>
      </div>

      {/* Batsmen & Bowler Cards - Professional Style */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Striker */}
        <div className="bg-base-100 rounded-xl border-2 border-primary/30 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-primary uppercase tracking-wide">Striker</span>
            <div className="flex items-center gap-1">
              <button onClick={() => handleRetireBatsman('striker')} className="btn btn-ghost btn-xs text-warning">
                Retire
              </button>
              <span className="badge badge-primary badge-sm">On Strike</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary text-primary-content flex items-center justify-center font-bold text-lg">
              {matchState.striker?.jerseyNumber || '*'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{matchState.striker?.name || 'Select Striker'}</p>
              <p className="text-xs text-base-content/60">{matchState.striker?.battingStyle || 'Right Handed'}</p>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-base-200 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">{strikerCard?.runs || 0}</p>
              <p className="text-[10px] text-base-content/50">RUNS</p>
            </div>
            <div>
              <p className="text-lg font-semibold">{strikerCard?.balls || 0}</p>
              <p className="text-[10px] text-base-content/50">BALLS</p>
            </div>
            <div>
              <p className="text-lg font-semibold">{strikerCard?.fours || 0}/{strikerCard?.sixes || 0}</p>
              <p className="text-[10px] text-base-content/50">4s/6s</p>
            </div>
            <div>
              <p className="text-lg font-semibold">{getStrikeRate(strikerCard?.runs || 0, strikerCard?.balls || 0)}</p>
              <p className="text-[10px] text-base-content/50">SR</p>
            </div>
          </div>
        </div>

        {/* Non-Striker */}
        <div className="bg-base-100 rounded-xl border border-base-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-base-content/60 uppercase tracking-wide">Non-Striker</span>
            <div className="flex items-center gap-1">
              <button onClick={() => handleRetireBatsman('nonStriker')} className="btn btn-ghost btn-xs text-warning">
                Retire
              </button>
              <button onClick={handleSwapBatsmen} className="btn btn-ghost btn-xs gap-1">
                <HiArrowsRightLeft className="w-3 h-3" /> Swap
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-base-300 flex items-center justify-center font-bold text-lg">
              {matchState.nonStriker?.jerseyNumber || '2'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{matchState.nonStriker?.name || 'Select Non-Striker'}</p>
              <p className="text-xs text-base-content/60">{matchState.nonStriker?.battingStyle || 'Right Handed'}</p>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-base-200 text-center">
            <div>
              <p className="text-2xl font-bold">{nonStrikerCard?.runs || 0}</p>
              <p className="text-[10px] text-base-content/50">RUNS</p>
            </div>
            <div>
              <p className="text-lg font-semibold">{nonStrikerCard?.balls || 0}</p>
              <p className="text-[10px] text-base-content/50">BALLS</p>
            </div>
            <div>
              <p className="text-lg font-semibold">{nonStrikerCard?.fours || 0}/{nonStrikerCard?.sixes || 0}</p>
              <p className="text-[10px] text-base-content/50">4s/6s</p>
            </div>
            <div>
              <p className="text-lg font-semibold">{getStrikeRate(nonStrikerCard?.runs || 0, nonStrikerCard?.balls || 0)}</p>
              <p className="text-[10px] text-base-content/50">SR</p>
            </div>
          </div>
        </div>

        {/* Bowler */}
        <div className="bg-base-100 rounded-xl border border-base-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-secondary uppercase tracking-wide">Bowler</span>
            <button onClick={() => setShowChangeBowlerModal(true)} className="btn btn-ghost btn-xs">
              Change
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-secondary text-secondary-content flex items-center justify-center font-bold text-lg">
              {matchState.bowler?.jerseyNumber || '🏏'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{matchState.bowler?.name || 'Select Bowler'}</p>
              <p className="text-xs text-base-content/60">
                {matchState.bowler?.bowlingStyle && matchState.bowler.bowlingStyle !== 'None' 
                  ? matchState.bowler.bowlingStyle 
                  : 'Right Arm'}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-base-200 text-center">
            <div>
              <p className="text-lg font-bold text-secondary">{Math.floor((bowlerCard?.balls || 0) / 6)}.{(bowlerCard?.balls || 0) % 6}</p>
              <p className="text-[10px] text-base-content/50">OVERS</p>
            </div>
            <div>
              <p className="text-lg font-semibold">{bowlerCard?.runs || 0}</p>
              <p className="text-[10px] text-base-content/50">RUNS</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-red-500">{bowlerCard?.wickets || 0}</p>
              <p className="text-[10px] text-base-content/50">WKTS</p>
            </div>
            <div>
              <p className="text-lg font-semibold">{getEconomy(bowlerCard?.runs || 0, bowlerCard?.balls || 0)}</p>
              <p className="text-[10px] text-base-content/50">ECON</p>
            </div>
          </div>
        </div>
      </div>

      {/* Scoring Panel */}
      <div className="bg-base-100 rounded-xl border border-base-200 p-5 shadow-sm">
        {/* Runs */}
        <div className="mb-5">
          <h3 className="font-semibold text-sm text-base-content/60 mb-3 uppercase tracking-wide">Runs</h3>
          <div className="grid grid-cols-7 gap-2">
            {[0, 1, 2, 3, 4, 5, 6].map(runs => (
              <button
                key={runs}
                onClick={() => handleQuickRun(runs)}
                disabled={isSubmitting}
                className={`btn btn-lg font-bold text-xl ${
                  runs === 4 ? 'btn-info text-white' : 
                  runs === 6 ? 'btn-success text-white' : 
                  runs === 0 ? 'btn-ghost border-2 border-base-300' :
                  'btn-ghost border border-base-300 hover:bg-base-200'
                }`}
              >
                {runs}
              </button>
            ))}
          </div>
        </div>

        {/* Extras */}
        <div className="mb-5">
          <h3 className="font-semibold text-sm text-base-content/60 mb-3 uppercase tracking-wide">Extras</h3>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
            <button onClick={() => handleWide(0)} disabled={isSubmitting} className="btn btn-warning gap-1">Wd</button>
            <button onClick={() => handleWide(1)} disabled={isSubmitting} className="btn btn-warning btn-outline">Wd+1</button>
            <button onClick={() => handleWide(2)} disabled={isSubmitting} className="btn btn-warning btn-outline">Wd+2</button>
            <button onClick={() => handleWide(3)} disabled={isSubmitting} className="btn btn-warning btn-outline">Wd+3</button>
            <button onClick={() => handleNoBall(0)} disabled={isSubmitting} className="btn btn-warning gap-1">Nb</button>
            <button onClick={() => handleNoBall(1)} disabled={isSubmitting} className="btn btn-warning btn-outline">Nb+1</button>
            <button onClick={() => handleNoBall(2)} disabled={isSubmitting} className="btn btn-warning btn-outline">Nb+2</button>
            <button onClick={() => handleNoBall(4)} disabled={isSubmitting} className="btn btn-warning btn-outline">Nb+4</button>
          </div>
          <div className="grid grid-cols-4 gap-2 mt-2">
            <button onClick={() => handleBye(1)} disabled={isSubmitting} className="btn btn-outline">1 Bye</button>
            <button onClick={() => handleBye(2)} disabled={isSubmitting} className="btn btn-outline">2 Byes</button>
            <button onClick={() => handleLegBye(1)} disabled={isSubmitting} className="btn btn-outline">1 LB</button>
            <button onClick={() => handleLegBye(2)} disabled={isSubmitting} className="btn btn-outline">2 LB</button>
          </div>
        </div>

        {/* Wicket */}
        <div className="mb-5">
          <h3 className="font-semibold text-sm text-base-content/60 mb-3 uppercase tracking-wide">Wicket</h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            <button onClick={() => setShowWicketModal(true)} className="btn btn-error gap-1">
              <HiXMark className="w-4 h-4" /> OUT
            </button>
            <button onClick={() => handleWicket('bowled')} disabled={isSubmitting} className="btn btn-error btn-outline">Bowled</button>
            <button onClick={() => { setSelectedWicketType('caught'); setShowWicketModal(true) }} disabled={isSubmitting} className="btn btn-error btn-outline">Caught</button>
            <button onClick={() => handleWicket('lbw')} disabled={isSubmitting} className="btn btn-error btn-outline">LBW</button>
            <button onClick={() => { setSelectedWicketType('runout'); setShowWicketModal(true) }} disabled={isSubmitting} className="btn btn-error btn-outline">Run Out</button>
            <button onClick={() => { setSelectedWicketType('stumped'); setShowWicketModal(true) }} disabled={isSubmitting} className="btn btn-error btn-outline">Stumped</button>
          </div>
        </div>

        {/* Loading Indicator */}
        {isSubmitting && (
          <div className="flex items-center justify-center gap-2 text-primary py-2">
            <span className="loading loading-spinner loading-sm"></span>
            <span className="text-sm">Recording...</span>
          </div>
        )}
      </div>

      {/* Match Controls */}
      <div className="bg-base-100 rounded-xl border border-base-200 p-5 shadow-sm">
        <h3 className="font-semibold text-sm text-base-content/60 mb-3 uppercase tracking-wide">Match Controls</h3>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setShowEndInningsModal(true)} className="btn btn-outline gap-1">
            <HiArrowPath className="w-4 h-4" /> End Innings
          </button>
          <button
            onClick={() => handleEndMatch(selectedMatch?.teamA?._id, `${selectedMatch?.teamA?.name} won`)}
            className="btn btn-outline btn-success gap-1"
          >
            <HiCheck className="w-4 h-4" /> {selectedMatch?.teamA?.shortName} Won
          </button>
          <button
            onClick={() => handleEndMatch(selectedMatch?.teamB?._id, `${selectedMatch?.teamB?.name} won`)}
            className="btn btn-outline btn-success gap-1"
          >
            <HiCheck className="w-4 h-4" /> {selectedMatch?.teamB?.shortName} Won
          </button>
          <button onClick={() => handleEndMatch(null, 'Match Tied')} className="btn btn-outline">Tie</button>
          <button onClick={() => handleEndMatch(null, 'No Result')} className="btn btn-outline btn-warning gap-1">
            <HiExclamationTriangle className="w-4 h-4" /> No Result
          </button>
        </div>
      </div>

      {/* ==================== MODALS ==================== */}
      
      {/* New Batsman Modal */}
      <Modal
        isOpen={showNewBatsmanModal}
        onClose={() => {}}
        title="🏏 New Batsman Required"
        size="md"
      >
        <div className="space-y-3">
          <p className="text-base-content/60 mb-4">
            Wicket fallen! Select the next batsman to continue.
          </p>
          {getAvailableBatsmen().length === 0 ? (
            <div className="text-center py-6">
              <HiExclamationTriangle className="w-12 h-12 mx-auto text-error mb-2" />
              <p className="text-error font-semibold">All Out!</p>
              <p className="text-sm text-base-content/60">No batsmen remaining</p>
              <button onClick={() => setShowEndInningsModal(true)} className="btn btn-primary mt-4">
                End Innings
              </button>
            </div>
          ) : (
            getAvailableBatsmen().map(player => (
              <button
                key={player._id}
                onClick={() => handleNewBatsman(player)}
                className="w-full flex items-center gap-3 p-4 bg-base-200 rounded-xl hover:bg-base-300 transition-all hover:scale-[1.01]"
              >
                <div className="w-12 h-12 rounded-full bg-primary text-primary-content flex items-center justify-center font-bold text-lg">
                  {player.jerseyNumber || '#'}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-lg">{player.name}</p>
                  <p className="text-sm text-base-content/60">{player.role} • {player.battingStyle}</p>
                </div>
                <HiChevronRight className="w-5 h-5 text-base-content/40" />
              </button>
            ))
          )}
        </div>
      </Modal>

      {/* Retire Batsman Modal */}
      <Modal
        isOpen={showRetireBatsmanModal}
        onClose={() => { setShowRetireBatsmanModal(false); setRetiringBatsman(null); }}
        title="🏃 Retire Batsman"
        size="md"
      >
        <div className="space-y-3">
          <p className="text-base-content/60 mb-4">
            Retiring: <span className="font-semibold text-warning">
              {retiringBatsman === 'striker' ? matchState.striker?.name : matchState.nonStriker?.name}
            </span>
            <br />
            Select replacement batsman:
          </p>
          {getAvailableBatsmen().length === 0 ? (
            <div className="text-center py-6">
              <HiExclamationTriangle className="w-12 h-12 mx-auto text-warning mb-2" />
              <p className="text-warning font-semibold">No batsmen available</p>
              <p className="text-sm text-base-content/60">All players have batted</p>
              <button 
                onClick={() => { setShowRetireBatsmanModal(false); setRetiringBatsman(null); }} 
                className="btn btn-ghost mt-4"
              >
                Cancel
              </button>
            </div>
          ) : (
            getAvailableBatsmen().map(player => (
              <button
                key={player._id}
                onClick={() => handleSelectReplacementBatsman(player)}
                className="w-full flex items-center gap-3 p-4 bg-base-200 rounded-xl hover:bg-base-300 transition-all hover:scale-[1.01]"
              >
                <div className="w-12 h-12 rounded-full bg-primary text-primary-content flex items-center justify-center font-bold text-lg">
                  {player.jerseyNumber || '#'}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-lg">{player.name}</p>
                  <p className="text-sm text-base-content/60">{player.role} • {player.battingStyle}</p>
                </div>
                <HiChevronRight className="w-5 h-5 text-base-content/40" />
              </button>
            ))
          )}
        </div>
      </Modal>

      {/* Change Bowler Modal */}
      <Modal
        isOpen={showChangeBowlerModal}
        onClose={() => setShowChangeBowlerModal(false)}
        title="⚾ Select Bowler"
        size="md"
      >
        <div className="space-y-3">
          <p className="text-base-content/60 mb-4">
            {matchState.lastOverBowler ? `${matchState.lastOverBowler.name} bowled last over.` : 'Select the bowler for this over.'}
          </p>
          {getAvailableBowlers().map(player => (
            <button
              key={getPlayerId(player)}
              onClick={() => handleChangeBowler(player)}
              disabled={getPlayerId(player) === getPlayerId(matchState.bowler)}
              className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all ${
                getPlayerId(player) === getPlayerId(matchState.bowler)
                  ? 'bg-secondary/20 border-2 border-secondary cursor-default'
                  : getPlayerId(player) === getPlayerId(matchState.lastOverBowler)
                  ? 'bg-base-300 opacity-50 cursor-not-allowed'
                  : 'bg-base-200 hover:bg-base-300 hover:scale-[1.01]'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-secondary text-secondary-content flex items-center justify-center font-bold text-lg">
                {player.jerseyNumber || '#'}
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-lg">{player.name}</p>
                <p className="text-sm text-base-content/60">
                  {player.bowlingStyle && player.bowlingStyle !== 'None' ? player.bowlingStyle : player.role}
                </p>
              </div>
              {getPlayerId(player) === getPlayerId(matchState.bowler) && (
                <span className="badge badge-secondary">Current</span>
              )}
              {getPlayerId(player) === getPlayerId(matchState.lastOverBowler) && (
                <span className="badge badge-warning">Last Over</span>
              )}
            </button>
          ))}
        </div>
      </Modal>

      {/* Wicket Type Modal */}
      <Modal
        isOpen={showWicketModal}
        onClose={() => { setShowWicketModal(false); setSelectedWicketType(null); setSelectedFielder(null); }}
        title="🔴 Wicket Details"
        size="md"
      >
        <div className="space-y-4">
          {!selectedWicketType ? (
            <>
              <p className="text-base-content/60">Select wicket type:</p>
              <div className="grid grid-cols-2 gap-3">
                {['bowled', 'caught', 'lbw', 'runout', 'stumped', 'hitwicket'].map(type => (
                  <button
                    key={type}
                    onClick={() => {
                      if (type === 'bowled' || type === 'lbw' || type === 'hitwicket') {
                        handleWicket(type)
                      } else {
                        setSelectedWicketType(type)
                      }
                    }}
                    className="btn btn-error btn-outline capitalize py-4"
                  >
                    {type === 'runout' ? 'Run Out' : type === 'hitwicket' ? 'Hit Wicket' : type}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <p className="text-base-content/60">
                {selectedWicketType === 'caught' && 'Select the fielder who caught the ball:'}
                {selectedWicketType === 'runout' && 'Select the fielder involved in run out:'}
                {selectedWicketType === 'stumped' && 'Select the wicket keeper:'}
              </p>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {selectedWicketType === 'caught' && (
                  <button
                    onClick={() => handleWicket('caught', null)}
                    className="w-full p-3 bg-secondary/20 rounded-lg hover:bg-secondary/30 text-left"
                  >
                    <p className="font-semibold">Caught & Bowled</p>
                    <p className="text-xs text-base-content/60">Bowler caught the ball</p>
                  </button>
                )}
                {getBowlingTeamPlayers().map(player => (
                  <button
                    key={player._id}
                    onClick={() => handleWicket(selectedWicketType, player)}
                    className="w-full flex items-center gap-3 p-3 bg-base-200 rounded-lg hover:bg-base-300"
                  >
                    <div className="w-10 h-10 rounded-full bg-secondary text-secondary-content flex items-center justify-center font-bold">
                      {player.jerseyNumber || '#'}
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">{player.name}</p>
                      <p className="text-xs text-base-content/60">{player.role}</p>
                    </div>
                  </button>
                ))}
              </div>
              <button 
                onClick={() => setSelectedWicketType(null)} 
                className="btn btn-ghost btn-sm w-full mt-2"
              >
                ← Back to wicket types
              </button>
            </>
          )}
        </div>
      </Modal>

      {/* End Innings Modal */}
      <Modal
        isOpen={showEndInningsModal}
        onClose={() => setShowEndInningsModal(false)}
        title={matchState.currentInnings === 1 ? "End First Innings?" : "End Match?"}
        size="sm"
      >
        <div className="space-y-4">
          <div className="bg-base-200 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold">
              {matchState.totalRuns}/{matchState.totalWickets}
            </p>
            <p className="text-base-content/60">
              ({formatOvers(matchState.currentOver, matchState.currentBall)} overs)
            </p>
          </div>
          {matchState.currentInnings === 1 ? (
            <p className="text-center text-base-content/60">
              Target for {getBowlingTeamInfo()?.name}: <strong>{matchState.totalRuns + 1} runs</strong>
            </p>
          ) : (
            <p className="text-center text-base-content/60">
              {matchState.totalRuns >= matchState.target 
                ? `${getBattingTeamInfo()?.name} wins!`
                : `${getBowlingTeamInfo()?.name} wins by ${matchState.target - matchState.totalRuns - 1} runs!`}
            </p>
          )}
          <div className="flex gap-2">
            <button onClick={() => setShowEndInningsModal(false)} className="btn btn-ghost flex-1">
              Cancel
            </button>
            <button onClick={handleEndInnings} className="btn btn-primary flex-1">
              {matchState.currentInnings === 1 ? 'Start 2nd Innings' : 'End Match'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Undo Confirmation Modal */}
      <Modal
        isOpen={showUndoModal}
        onClose={() => setShowUndoModal(false)}
        title="Undo Last Ball?"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-base-content/60">
            This will revert the last ball recorded. This action cannot be undone.
          </p>
          <div className="flex gap-2">
            <button onClick={() => setShowUndoModal(false)} className="btn btn-ghost flex-1">Cancel</button>
            <button onClick={handleUndo} className="btn btn-warning flex-1">Undo Ball</button>
          </div>
        </div>
      </Modal>

      {/* Scorecard Modal */}
      <Modal
        isOpen={showScorecardModal}
        onClose={() => setShowScorecardModal(false)}
        title="📊 Live Scorecard"
        size="lg"
      >
        <div className="space-y-6">
          {/* Batting Card */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              🏏 {getBattingTeamInfo()?.name} - Batting
            </h3>
            <div className="overflow-x-auto">
              <table className="table table-sm">
                <thead className="bg-base-200">
                  <tr>
                    <th>Batsman</th>
                    <th className="text-center">R</th>
                    <th className="text-center">B</th>
                    <th className="text-center">4s</th>
                    <th className="text-center">6s</th>
                    <th className="text-center">SR</th>
                  </tr>
                </thead>
                <tbody>
                  {matchState.battingCard.map((bat, idx) => (
                    <tr key={idx} className={bat.isOut ? 'opacity-60' : ''}>
                      <td>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{bat.player?.name}</span>
                          {bat.player?._id === matchState.striker?._id && (
                            <span className="badge badge-primary badge-xs">*</span>
                          )}
                          {bat.isOut && (
                            <span className="text-xs text-base-content/50">{bat.dismissal?.text}</span>
                          )}
                        </div>
                      </td>
                      <td className="text-center font-bold">{bat.runs}</td>
                      <td className="text-center">{bat.balls}</td>
                      <td className="text-center">{bat.fours}</td>
                      <td className="text-center">{bat.sixes}</td>
                      <td className="text-center">{getStrikeRate(bat.runs, bat.balls)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-base-200">
                  <tr>
                    <td className="font-semibold">Extras</td>
                    <td colSpan={5} className="text-right">
                      {matchState.extras.total} (Wd {matchState.extras.wides}, Nb {matchState.extras.noBalls}, B {matchState.extras.byes}, Lb {matchState.extras.legByes})
                    </td>
                  </tr>
                  <tr>
                    <td className="font-bold">Total</td>
                    <td colSpan={5} className="text-right font-bold">
                      {matchState.totalRuns}/{matchState.totalWickets} ({formatOvers(matchState.currentOver, matchState.currentBall)} Ov)
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Bowling Card */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              ⚾ {getBowlingTeamInfo()?.name} - Bowling
            </h3>
            <div className="overflow-x-auto">
              <table className="table table-sm">
                <thead className="bg-base-200">
                  <tr>
                    <th>Bowler</th>
                    <th className="text-center">O</th>
                    <th className="text-center">M</th>
                    <th className="text-center">R</th>
                    <th className="text-center">W</th>
                    <th className="text-center">Econ</th>
                  </tr>
                </thead>
                <tbody>
                  {matchState.bowlingCard.map((bowl, idx) => (
                    <tr key={idx}>
                      <td>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{bowl.player?.name}</span>
                          {bowl.player?._id === matchState.bowler?._id && (
                            <span className="badge badge-secondary badge-xs">*</span>
                          )}
                        </div>
                      </td>
                      <td className="text-center">{Math.floor(bowl.balls / 6)}.{bowl.balls % 6}</td>
                      <td className="text-center">{bowl.maidens}</td>
                      <td className="text-center">{bowl.runs}</td>
                      <td className="text-center font-bold text-error">{bowl.wickets}</td>
                      <td className="text-center">{getEconomy(bowl.runs, bowl.balls)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Fall of Wickets */}
          {matchState.fallOfWickets.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Fall of Wickets</h3>
              <p className="text-sm text-base-content/70">
                {matchState.fallOfWickets.map((fow, idx) => (
                  <span key={idx}>
                    {fow.runs}/{fow.wicket} ({fow.batsman?.name}, {fow.overs})
                    {idx < matchState.fallOfWickets.length - 1 ? ' • ' : ''}
                  </span>
                ))}
              </p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}

// ============ STATS TAB ============
const StatsTab = () => {
  const queryClient = useQueryClient()
  const [isRecalculating, setIsRecalculating] = useState(false)

  const { data: teamsData, refetch: refetchTeams } = useQuery({
    queryKey: ['admin-teams'],
    queryFn: teamsApi.getAllTeams
  })

  const teams = (teamsData?.data || []).sort((a, b) => {
    const pointsDiff = (b.stats?.points || 0) - (a.stats?.points || 0)
    if (pointsDiff !== 0) return pointsDiff
    return (b.stats?.nrr || 0) - (a.stats?.nrr || 0)
  })

  const handleRecalculateStats = async () => {
    if (!confirm('This will recalculate all player stats from ball-by-ball data. Continue?')) return
    
    setIsRecalculating(true)
    try {
      const result = await playersApi.recalculateAllStats()
      toast.success(`Stats recalculated! Updated ${result.data?.updated || 0} players.`)
      // Refresh all data
      queryClient.invalidateQueries(['admin-teams'])
      queryClient.invalidateQueries(['teams'])
      queryClient.invalidateQueries(['players'])
      refetchTeams()
    } catch (error) {
      toast.error(error.message || 'Failed to recalculate stats')
    } finally {
      setIsRecalculating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-epic font-bold text-2xl">Points Table</h2>
          <p className="text-base-content/60">HPL 2026 standings</p>
        </div>
        <button
          onClick={handleRecalculateStats}
          disabled={isRecalculating}
          className="btn btn-primary gap-2"
        >
          {isRecalculating ? (
            <>
              <span className="loading loading-spinner loading-sm"></span>
              Recalculating...
            </>
          ) : (
            <>
              <HiArrowPath className="w-5 h-5" />
              Recalculate All Stats
            </>
          )}
        </button>
      </div>

      <div className="bg-base-100 rounded-xl border border-base-200 overflow-hidden">
        <table className="table">
          <thead className="bg-gradient-to-r from-hpl-maroon to-hpl-navy text-white">
            <tr>
              <th>#</th>
              <th>Team</th>
              <th className="text-center">P</th>
              <th className="text-center">W</th>
              <th className="text-center">L</th>
              <th className="text-center">T</th>
              <th className="text-center">NRR</th>
              <th className="text-center">Pts</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((team, index) => (
              <tr key={team._id} className="hover">
                <td className="font-bold">{index + 1}</td>
                <td>
                  <div className="flex items-center gap-3">
                    {team.logo ? (
                      <img src={team.logo} alt="" className="w-8 h-8 rounded object-contain bg-white p-0.5" />
                    ) : (
                      <div 
                        className="w-8 h-8 rounded flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: team.primaryColor }}
                      >
                        {team.shortName}
                      </div>
                    )}
                    <span className="font-medium">{team.name}</span>
                  </div>
                </td>
                <td className="text-center">{team.stats?.matchesPlayed ?? 0}</td>
                <td className="text-center text-success font-medium">{team.stats?.wins ?? 0}</td>
                <td className="text-center text-error font-medium">{team.stats?.losses ?? 0}</td>
                <td className="text-center">{team.stats?.ties ?? 0}</td>
                <td className="text-center">
                  <span className={team.stats?.nrr >= 0 ? 'text-success' : 'text-error'}>
                    {team.stats?.nrr >= 0 ? '+' : ''}{(team.stats?.nrr ?? 0).toFixed(3)}
                  </span>
                </td>
                <td className="text-center font-bold text-primary">{team.stats?.points ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ============ MAIN ADMIN COMPONENT ============
const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [admin, setAdmin] = useState(null)
  const [activeTab, setActiveTab] = useState('teams')

  useEffect(() => {
    // Check for existing auth
    const token = authApi.getToken()
    const savedAdmin = authApi.getAdmin()
    if (token && savedAdmin) {
      setIsAuthenticated(true)
      setAdmin(savedAdmin)
    }
  }, [])

  const handleLogin = (success, adminData) => {
    setIsAuthenticated(success)
    setAdmin(adminData)
  }

  const handleLogout = () => {
    authApi.logout()
    setIsAuthenticated(false)
    setAdmin(null)
    toast.success('Logged out successfully')
  }

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />
  }

  const tabs = [
    { id: 'teams', label: 'Teams', icon: HiUserGroup },
    { id: 'matches', label: 'Matches', icon: HiCalendar },
    { id: 'scoring', label: 'Live Scoring', icon: HiPlayCircle },
    { id: 'stats', label: 'Standings', icon: HiChartBar },
  ]

  return (
    <div className="min-h-screen bg-base-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-hpl-maroon to-hpl-navy text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                <HiTrophy className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-epic font-bold text-xl">HPL 2026 Admin</h1>
                <p className="text-white/70 text-sm">Welcome, {admin?.name || 'Organizer'}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="btn btn-ghost btn-sm text-white hover:bg-white/20">
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-base-100 border-b border-base-200 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex gap-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2
                  ${activeTab === tab.id 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-base-content/60 hover:text-base-content'
                  }
                `}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'teams' && <TeamsTab />}
            {activeTab === 'matches' && <MatchesTab onGoToScoring={() => setActiveTab('scoring')} />}
            {activeTab === 'scoring' && <ScoringTab />}
            {activeTab === 'stats' && <StatsTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default Admin
