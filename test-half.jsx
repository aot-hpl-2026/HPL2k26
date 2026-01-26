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
                placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
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
                      <p className="text-2xl font-bold">
                        {match.score.runs}/{match.score.wickets}
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
    // For setup phase, determine based on toss
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
    // For setup phase, determine based on toss (opposite of batting)
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
    return oversRemaining > 0 ? (runsNeeded / oversRemaining).toFixed(2) : 'âˆž'
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
        b.player._id === playerId ? { ...b, ...updates } : b
      )
    }))
  }

  // Update bowler stats in scorecard
  const updateBowlerStats = (playerId, updates) => {
    setMatchState(prev => ({
      ...prev,
      bowlingCard: prev.bowlingCard.map(b => 
        b.player._id === playerId ? { ...b, ...updates } : b
      )
    }))
  }

  // Get available batsmen (not yet batted or not out)
  const getAvailableBatsmen = () => {
    return getBattingTeamPlayers().filter(p => 
      !matchState.usedBatsmen.includes(p._id)
    )
  }

  // Get available bowlers (not last over bowler)
  const getAvailableBowlers = () => {
    return getBowlingTeamPlayers().filter(p => 
      p._id !== matchState.lastOverBowler?._id
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
      const battingTeam = getBattingTeamFromToss()
      const battingTeamId = battingTeam === 'A' ? selectedMatch.teamA?._id : selectedMatch.teamB?._id
      const bowlingTeamId = battingTeam === 'A' ? selectedMatch.teamB?._id : selectedMatch.teamA?._id

      // Call API to start innings
      await matchesApi.startInnings(selectedMatch._id, {
        toss: { winner: setupData.tossWinner, decision: setupData.tossDecision },
        battingTeamId,
        bowlingTeamId,
        openers: [setupData.striker, setupData.nonStriker],
        bowler: setupData.bowler
      })

      // Initialize match state
      setMatchState({
        currentInnings: 1,
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
        usedBatsmen: [setupData.striker._id, setupData.nonStriker._id],
        usedBowlers: [setupData.bowler._id],
        lastOverBowler: null,
        target: null,
        firstInningsScore: null
      })

      setScoringPhase('scoring')
      queryClient.invalidateQueries(['admin-live-matches'])
      queryClient.invalidateQueries(['admin-all-matches'])
      toast.success('Match started! Good luck! ðŸ')
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

      // Save current state for undo
      setBallHistory(prev => [...prev.slice(-20), { ...matchState }])

      // Calculate total runs for this ball
      const totalBallRuns = runs + extraRuns

      // Update striker stats (if runs off bat)
      if (runs > 0 && matchState.striker) {
        const strikerCard = matchState.battingCard.find(b => b.player._id === matchState.striker._id)
        if (strikerCard) {
          updateBatsmanStats(matchState.striker._id, {
            runs: strikerCard.runs + runs,
            fours: strikerCard.fours + (runs === 4 ? 1 : 0),
            sixes: strikerCard.sixes + (runs === 6 ? 1 : 0)
          })
        }
      }

      // Update striker balls faced (legal deliveries only, not wides)
      if (!isExtra || (extraType !== 'wide')) {
        const strikerCard = matchState.battingCard.find(b => b.player._id === matchState.striker._id)
        if (strikerCard) {
          updateBatsmanStats(matchState.striker._id, {
            balls: strikerCard.balls + 1
          })
        }
      }

      // Update bowler stats
      const bowlerCard = matchState.bowlingCard.find(b => b.player._id === matchState.bowler._id)
      if (bowlerCard) {
        const newBalls = !isExtra ? bowlerCard.balls + 1 : bowlerCard.balls
        const newRuns = bowlerCard.runs + totalBallRuns
        const newWickets = bowlerCard.wickets + (isWicket ? 1 : 0)
        
        updateBowlerStats(matchState.bowler._id, {
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

      // Swap batsmen on odd runs (only for runs off bat, not extras like byes)
      if (!isWicket && runs % 2 === 1) {
        shouldSwapBatsmen = !shouldSwapBatsmen // Toggle because we might already swap at over end
      }

      // Calculate new totals
      const newTotalRuns = matchState.totalRuns + totalBallRuns
      const newTotalWickets = matchState.totalWickets + (isWicket ? 1 : 0)
      const newTotalBalls = !isExtra ? matchState.totalBalls + 1 : matchState.totalBalls

      // Send to server
      await socketService.sendScoreUpdate(selectedMatch._id, {
        over: newCurrentOver,
        ball: newCurrentBall,
        runs: totalBallRuns,
        runsOffBat: runs,
        extras: extraRuns,
        extraType,
        wicket: isWicket,
        dismissal,
        striker: matchState.striker?.name,
        nonStriker: matchState.nonStriker?.name,
        bowler: matchState.bowler?.name,
        strikerId: matchState.striker?._id,
        nonStrikerId: matchState.nonStriker?._id,
        bowlerId: matchState.bowler?._id,
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
            b.player._id === prev.striker?._id 
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
    // Example implementation (customize as needed)
    let text = ''
    if (isWicket) {
      text = 'W'
    } else if (isExtra) {
      if (extraType === 'wide') text = `Wd+${extraRuns}`
      else if (extraType === 'noball') text = `Nb+${extraRuns}`
      else if (extraType === 'bye') text = `B+${extraRuns}`
      else if (extraType === 'legbye') text = `Lb+${extraRuns}`
      else text = `Ex+${extraRuns}`
    } else {
      text = runs.toString()
    }
    return text
  }
}