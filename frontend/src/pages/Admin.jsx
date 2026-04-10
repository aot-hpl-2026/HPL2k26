import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  HiUserGroup,
  HiCalendar,
  HiChartBar,
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
  HiCheck,
  HiExclamationTriangle,
  HiTableCells,
  HiChevronRight,
  HiPencilSquare
} from 'react-icons/hi2'
import { authApi, matchesApi, teamsApi, playersApi } from '../services/api'
import { getAvatarUrl } from '../utils'

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
const TeamManagementCard = ({ team, onEdit, onManagePlayers, onDelete }) => {
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
            title="Manage Players"
          >
            <HiUsers className="w-4 h-4" /> Players
          </button>
          <button 
            onClick={() => onEdit(team)}
            className="btn btn-sm btn-primary gap-1"
            title="Edit Team"
          >
            <HiPencil className="w-4 h-4" />
          </button>
          <button 
            onClick={() => onDelete(team)}
            className="btn btn-sm btn-error btn-outline gap-1"
            title="Delete Team"
          >
            <HiTrash className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ============ DELETE TEAM MODAL ============
const DeleteTeamModal = ({ team, isOpen, onClose, onDelete, isDeleting }) => {
  const [confirmName, setConfirmName] = useState('')
  const [errorInput, setErrorInput] = useState(false)
  
  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setConfirmName('')
      setErrorInput(false)
    }
  }, [isOpen])

  if (!isOpen || !team) return null
  
  const isMatch = team && confirmName === team.name

  const handleDelete = () => {
    if (isMatch) {
      onDelete(team._id)
    } else {
      setErrorInput(true)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Delete ${team.name}`}
      size="sm"
    >
      <div className="space-y-4">
        <div className="alert alert-error bg-error/10 text-error border-error/20">
          <HiExclamationTriangle className="w-6 h-6 shrink-0" />
          <div className="w-full">
            <h3 className="font-bold">Warning: Irreversible Action</h3>
            <div className="text-xs mt-1 space-y-1">
              <p>This will permanently delete <strong>{team.name}</strong> and remove:</p>
              <ul className="list-disc list-inside opacity-80 pl-1">
                <li>All players in this team</li>
                <li>All team statistics and history</li>
                <li>Association with any matches</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">
              Type <span className="font-mono font-bold select-all bg-base-200 px-1 rounded">{team.name}</span> to confirm:
            </span>
          </label>
          <input
            type="text"
            value={confirmName}
            onChange={(e) => {
              setConfirmName(e.target.value)
              setErrorInput(false)
            }}
            className={`input input-bordered w-full ${errorInput ? 'input-error' : ''} ${isMatch ? 'input-success' : ''}`}
            placeholder={team.name}
            autoFocus
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <button 
            type="button" 
            onClick={onClose}
            className="btn btn-ghost"
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button 
            type="button" 
            onClick={handleDelete}
            className="btn btn-error"
            disabled={!isMatch || isDeleting}
          >
            {isDeleting ? <span className="loading loading-spinner loading-sm"></span> : 'Delete Team'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ============ DELETE MATCH MODAL ============
const DeleteMatchModal = ({ match, isOpen, onClose, onDelete, isDeleting }) => {
  if (!isOpen || !match) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Match"
      size="sm"
    >
      <div className="space-y-4">
        <div className="alert alert-error bg-error/10 text-error border-error/20">
          <HiExclamationTriangle className="w-6 h-6 shrink-0" />
          <div className="w-full">
            <h3 className="font-bold">Delete Scheduled Match?</h3>
            <div className="text-sm mt-1">
              <p>Are you sure you want to delete this match between:</p>
              <div className="font-bold my-1 p-2 bg-base-100 rounded border border-error/20">
                {match.teamA?.shortName || match.teamA?.name} vs {match.teamB?.shortName || match.teamB?.name}
              </div>
              <p className="opacity-80">This action cannot be undone.</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button 
            type="button" 
            onClick={onClose}
            className="btn btn-ghost"
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button 
            type="button" 
            onClick={() => onDelete(match._id)}
            className="btn btn-error"
            disabled={isDeleting}
          >
            {isDeleting ? <span className="loading loading-spinner loading-sm"></span> : 'Delete Match'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ============ TEAMS MANAGEMENT TAB ============
const TeamsTab = () => {
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [showPlayersModal, setShowPlayersModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState(null) // null means creating new team
  const [teamForm, setTeamForm] = useState({
    name: '',
    shortName: '',
    hostel: '',
    description: '',
    motto: '',
    primaryColor: '#8B1538',
    secondaryColor: '#FFD700',
    logo: null
  })

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

  // Helper to prepare FormData
  const prepareTeamFormData = (form) => {
    const formData = new FormData()
    formData.append('name', form.name)
    formData.append('shortName', form.shortName)
    formData.append('hostel', form.hostel)
    formData.append('description', form.description)
    formData.append('motto', form.motto)
    formData.append('primaryColor', form.primaryColor)
    formData.append('secondaryColor', form.secondaryColor)
    if (form.logo) {
      formData.append('logo', form.logo)
    }
    return formData
  }

  const createTeamMutation = useMutation({
    mutationFn: (data) => teamsApi.createTeam(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-teams'])
      setShowModal(false)
      toast.success('Team created successfully!')
    },
    onError: (error) => {
      toast.error('Failed to create team: ' + (error?.message || 'Unknown error'))
    }
  })

  const updateTeamMutation = useMutation({
    mutationFn: ({ teamId, data }) => teamsApi.updateTeam(teamId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-teams'])
      setShowModal(false)
      toast.success('Team updated successfully!')
    },
    onError: (error) => {
      toast.error('Failed to update team: ' + (error?.message || 'Unknown error'))
    }
  })

  const deleteTeamMutation = useMutation({
    mutationFn: (teamId) => teamsApi.deleteTeam(teamId),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-teams'])
      setShowDeleteModal(false)
      toast.success('Team deleted successfully!')
    },
    onError: (error) => {
      toast.error('Failed to delete team: ' + (error?.message || 'Unknown error'))
    }
  })

  const handleAddTeam = () => {
    setSelectedTeam(null)
    setTeamForm({
      name: '',
      shortName: '',
      hostel: '',
      description: '',
      motto: '',
      primaryColor: '#8B1538',
      secondaryColor: '#FFD700',
      logo: null
    })
    setShowModal(true)
  }

  const handleEditTeam = (team) => {
    setSelectedTeam(team)
    setTeamForm({
      name: team.name || '',
      shortName: team.shortName || '',
      hostel: team.hostel || '',
      description: team.description || '',
      motto: team.motto || '',
      primaryColor: team.primaryColor || '#8B1538',
      secondaryColor: team.secondaryColor || '#FFD700',
      logo: null // Don't preload file input
    })
    setShowModal(true)
  }

  const handleDeleteTeam = (team) => {
    setSelectedTeam(team)
    setShowDeleteModal(true)
  }

  const handleManagePlayers = (team) => {
    setSelectedTeam(team)
    setShowPlayersModal(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const formData = prepareTeamFormData(teamForm)
    
    if (selectedTeam) {
      updateTeamMutation.mutate({
        teamId: selectedTeam._id,
        data: formData
      })
    } else {
      createTeamMutation.mutate(formData)
    }
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
          <p className="text-base-content/60">Manage all HPL 2026 teams</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleAddTeam}
            className="btn btn-primary btn-sm gap-2"
          >
            <HiPlus className="w-4 h-4" /> Add Team
          </button>
          <button 
            onClick={() => queryClient.invalidateQueries(['admin-teams'])}
            className="btn btn-ghost btn-sm gap-2"
          >
            <HiArrowPath className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team) => (
          <TeamManagementCard
            key={team._id}
            team={team}
            onEdit={handleEditTeam}
            onManagePlayers={handleManagePlayers}
            onDelete={handleDeleteTeam}
          />
        ))}
      </div>

      {/* Delete Team Modal */}
      <DeleteTeamModal
        team={selectedTeam}
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onDelete={(teamId) => deleteTeamMutation.mutate(teamId)}
        isDeleting={deleteTeamMutation.isPending}
      />

      {/* Edit Team Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={`${selectedTeam ? 'Edit' : 'Add'} ${selectedTeam?.name || 'Team'}`}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label"><span className="label-text">Team Name</span></label>
              <input
                type="text"
                value={teamForm.name}
                onChange={(e) => setTeamForm(prev => ({ ...prev, name: e.target.value }))}
                className="input input-bordered"
                required
              />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Short Name</span></label>
              <input
                type="text"
                value={teamForm.shortName}
                onChange={(e) => setTeamForm(prev => ({ ...prev, shortName: e.target.value }))}
                className="input input-bordered"
                maxLength={4}
                required
              />
            </div>
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text">Hostel</span></label>
            <input
              type="text"
              value={teamForm.hostel}
              onChange={(e) => setTeamForm(prev => ({ ...prev, hostel: e.target.value }))}
              className="input input-bordered"
            />
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text">Motto</span></label>
            <input
              type="text"
              value={teamForm.motto}
              onChange={(e) => setTeamForm(prev => ({ ...prev, motto: e.target.value }))}
              className="input input-bordered"
            />
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text">Description</span></label>
            <textarea
              value={teamForm.description}
              onChange={(e) => setTeamForm(prev => ({ ...prev, description: e.target.value }))}
              className="textarea textarea-bordered"
              rows={3}
            />
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text">Team Logo</span></label>
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => setTeamForm(prev => ({ ...prev, logo: e.target.files[0] }))}
              className="file-input file-input-bordered file-input-sm w-full font-sans"
            />
            {selectedTeam?.logo && (
              <label className="label">
                <span className="label-text-alt text-base-content/60">Current logo will be kept if no file selected</span>
              </label>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label"><span className="label-text">Primary Color</span></label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={teamForm.primaryColor}
                  onChange={(e) => setTeamForm(prev => ({ ...prev, primaryColor: e.target.value }))}
                  className="w-12 h-12 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={teamForm.primaryColor}
                  onChange={(e) => setTeamForm(prev => ({ ...prev, primaryColor: e.target.value }))}
                  className="input input-bordered flex-1"
                />
              </div>
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Secondary Color</span></label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={teamForm.secondaryColor}
                  onChange={(e) => setTeamForm(prev => ({ ...prev, secondaryColor: e.target.value }))}
                  className="w-12 h-12 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={teamForm.secondaryColor}
                  onChange={(e) => setTeamForm(prev => ({ ...prev, secondaryColor: e.target.value }))}
                  className="input input-bordered flex-1"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost">
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={createTeamMutation.isPending || updateTeamMutation.isPending}
            >
              {(createTeamMutation.isPending || updateTeamMutation.isPending) ? <span className="loading loading-spinner loading-sm"></span> : (selectedTeam ? 'Save Changes' : 'Create Team')}
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
    mutationFn: (data) => {
      if (data instanceof FormData) {
        data.append('teamId', team._id)
        return playersApi.createPlayer(data)
      }
      return playersApi.createPlayer({ ...data, teamId: team._id })
    },
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
      isCaptain: false,
      image: null
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
      isCaptain: player.isCaptain || false,
      image: null
    })
    setShowAddForm(true)
  }

  // Helper to prepare form data for submission
  const prepareFormData = (formData) => {
    const data = new FormData()
    data.append('name', formData.name)
    if (formData.jerseyNumber) data.append('jerseyNumber', formData.jerseyNumber)
    data.append('role', formData.role)
    data.append('battingStyle', formData.battingStyle)
    data.append('bowlingStyle', formData.bowlingStyle || 'None')
    data.append('isCaptain', formData.isCaptain)
    if (formData.image) {
      data.append('image', formData.image)
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
                  onChange={(e) => {
                    const isChecked = e.target.checked
                    if (isChecked) {
                      const existingCaptain = players.find(p => p.isCaptain && p._id !== editingPlayer?._id)
                      if (existingCaptain) {
                        toast.error(`Team already has a captain: ${existingCaptain.name}`)
                        return
                      }
                    }
                    setForm(prev => ({ ...prev, isCaptain: isChecked }))
                  }}
                  className="checkbox checkbox-primary checkbox-sm"
                />
                <span className="label-text">Team Captain</span>
              </label>
            </div>
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text">Player Photo</span></label>
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => setForm(prev => ({ ...prev, image: e.target.files[0] }))}
              className="file-input file-input-bordered file-input-sm w-full font-sans"
            />
             <label className="label">
              <span className="label-text-alt text-base-content/60">Supported: JPG, PNG, WEBP</span>
            </label>
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
                <div className="avatar">
                  <div className="w-12 h-12 rounded-full ring ring-offset-2 ring-offset-base-100" style={{ '--tw-ring-color': team?.primaryColor || '#8B1538' }}>
                    <img src={player.imageUrl || getAvatarUrl(player.name)} alt={player.name} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-lg opacity-60">#{player.jerseyNumber}</span>
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
const MatchesTab = () => {
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


  const handleCreateMatch = (e) => {
    e.preventDefault()
    const formData = {
      ...form,
      // Treat datetime-local input as IST (UTC+5:30) before sending to backend
      scheduledAt: form.scheduledAt ? new Date(form.scheduledAt + '+05:30').toISOString() : form.scheduledAt
    }
    createMatchMutation.mutate(formData)
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
                      {new Date(match.scheduledAt).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}
                    </p>
                    <p className="text-sm font-medium">
                      {new Date(match.scheduledAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' })}
                    </p>
                  </div>
                  {getStatusBadge(match.status)}
                  
                  <button
                    onClick={() => handleDeleteMatch(match)}
                    className="btn btn-ghost btn-sm btn-square text-error"
                    title="Delete Match"
                  >
                    <HiTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
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

      {/* Delete Match Modal */}
      <DeleteMatchModal
        match={matchToDelete}
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onDelete={(matchId) => deleteMatchMutation.mutate(matchId)}
        isDeleting={deleteMatchMutation.isPending}
      />
    </div>
  )
}

// ============ MATCH STATS TAB ============
const MatchStatsFormModal = ({ match, onClose, onSuccess }) => {
  const queryClient = useQueryClient()
  const [step, setStep] = useState(1) // 1=toss, 2=inn1 batting, 3=inn1 bowling, 4=inn2 batting, 5=inn2 bowling, 6=result
  const [isSubmitting, setIsSubmitting] = useState(false)

  const teamAId = match?.teamA?._id || match?.teamA?.id
  const teamBId = match?.teamB?._id || match?.teamB?.id

  const { data: teamAPlayersData } = useQuery({ queryKey: ['team-players', teamAId], queryFn: () => playersApi.getPlayersByTeam(teamAId), enabled: !!teamAId })
  const { data: teamBPlayersData } = useQuery({ queryKey: ['team-players', teamBId], queryFn: () => playersApi.getPlayersByTeam(teamBId), enabled: !!teamBId })
  const playersA = teamAPlayersData?.data || []
  const playersB = teamBPlayersData?.data || []

  const isEditing = match?.status === 'completed'

  const [toss, setToss] = useState({ winner: teamAId || '', decision: 'bat' })
  const [innings, setInnings] = useState([
    { battingTeam: '', bowling: [], batting: [], extras: 0, penaltyRuns: 0 },
    { battingTeam: '', bowling: [], batting: [], extras: 0, penaltyRuns: 0 }
  ])
  const [resultData, setResultData] = useState({ winner: '', resultType: 'runs', result: '' })

  // Pre-populate form when editing a completed match
  useEffect(() => {
    if (!match?.innings?.length) return
    const id = s => s?._id?.toString?.() || s?.toString?.() || ''
    setToss({
      winner: id(match.toss?.winner) || teamAId || '',
      decision: match.toss?.decision || 'bat'
    })
    const mapped = match.innings.map(inn => ({
      battingTeam: id(inn.battingTeam),
      batting: (inn.batting || []).map(b => ({
        player: id(b.player), name: b.name || '',
        ones: b.ones || 0, twos: b.twos || 0, threes: b.threes || 0,
        fours: b.fours || 0, fives: b.fives || 0, sixes: b.sixes || 0,
        balls: b.balls || 0,
        dismissalType: b.dismissalType || '',
        bowler: id(b.bowler), fielder: id(b.fielder)
      })),
      bowling: (inn.bowling || []).map(b => ({
        player: id(b.player), name: b.name || '',
        overs: b.overs || 0, wickets: b.wickets || 0,
        wides: b.wides || 0, noBalls: b.noBalls || 0,
        runsPerOver: b.runsPerOver || []
      })),
      extras: inn.extras || 0,
      penaltyRuns: inn.penaltyRuns || 0
    }))
    setInnings([
      mapped[0] || { battingTeam: '', bowling: [], batting: [], extras: 0, penaltyRuns: 0 },
      mapped[1] || { battingTeam: '', bowling: [], batting: [], extras: 0, penaltyRuns: 0 }
    ])
    setResultData({
      winner: id(match.winner) || '',
      resultType: 'runs',
      result: match.result || ''
    })
  }, [match?._id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Determine batting teams from toss
  const getBattingTeamForInnings = (inningsNum) => {
    if (!toss.winner) return ''
    const tossWonByA = toss.winner === teamAId
    const tossWinnerBats = toss.decision === 'bat'
    const inn1Batter = (tossWonByA && tossWinnerBats) || (!tossWonByA && !tossWinnerBats) ? teamAId : teamBId
    return inningsNum === 1 ? inn1Batter : (inn1Batter === teamAId ? teamBId : teamAId)
  }

  const getBattingPlayers = (inningsNum) => {
    const battingTeamId = innings[inningsNum - 1].battingTeam || getBattingTeamForInnings(inningsNum)
    return battingTeamId === teamAId ? playersA : playersB
  }
  const getBowlingPlayers = (inningsNum) => {
    const battingTeamId = innings[inningsNum - 1].battingTeam || getBattingTeamForInnings(inningsNum)
    return battingTeamId === teamAId ? playersB : playersA
  }
  const getAllPlayers = () => [...playersA, ...playersB]

  const getTeamName = (teamId) => {
    if (!teamId) return ''
    return teamId === teamAId ? (match?.teamA?.name || 'Team A') : (match?.teamB?.name || 'Team B')
  }

  const updateInnings = (inningsIdx, field, value) => {
    setInnings(prev => {
      const next = [...prev]
      next[inningsIdx] = { ...next[inningsIdx], [field]: value }
      return next
    })
  }

  // Batting row helpers
  const emptyBatsman = () => ({ player: '', name: '', ones: 0, twos: 0, threes: 0, fours: 0, fives: 0, sixes: 0, balls: 0, dismissalType: '', bowler: '', fielder: '' })
  const emptyBowler = () => ({ player: '', name: '', overs: 0, wickets: 0, wides: 0, noBalls: 0, runsPerOver: [] })

  const addBatsman = (inningsIdx) => updateInnings(inningsIdx, 'batting', [...innings[inningsIdx].batting, emptyBatsman()])
  const removeBatsman = (inningsIdx, idx) => updateInnings(inningsIdx, 'batting', innings[inningsIdx].batting.filter((_, i) => i !== idx))
  const updateBatsman = (inningsIdx, idx, field, value) => {
    const next = innings[inningsIdx].batting.map((b, i) => i === idx ? { ...b, [field]: value } : b)
    updateInnings(inningsIdx, 'batting', next)
  }

  const addBowler = (inningsIdx) => updateInnings(inningsIdx, 'bowling', [...innings[inningsIdx].bowling, emptyBowler()])
  const removeBowler = (inningsIdx, idx) => updateInnings(inningsIdx, 'bowling', innings[inningsIdx].bowling.filter((_, i) => i !== idx))
  const updateBowler = (inningsIdx, idx, field, value) => {
    const next = innings[inningsIdx].bowling.map((b, i) => i === idx ? { ...b, [field]: value } : b)
    updateInnings(inningsIdx, 'bowling', next)
  }
  const updateBowlerRunsPerOver = (inningsIdx, bowlerIdx, overIdx, value) => {
    const bowler = innings[inningsIdx].bowling[bowlerIdx]
    const runsPerOver = [...(bowler.runsPerOver || [])]
    runsPerOver[overIdx] = Number(value) || 0
    updateBowler(inningsIdx, bowlerIdx, 'runsPerOver', runsPerOver)
  }
  const addOverToBowler = (inningsIdx, bowlerIdx) => {
    setInnings(prev => {
      const next = [...prev]
      const inn = { ...next[inningsIdx] }
      inn.bowling = inn.bowling.map((b, i) => {
        if (i !== bowlerIdx) return b
        const runsPerOver = [...(b.runsPerOver || []), 0]
        return { ...b, runsPerOver, overs: runsPerOver.length }
      })
      next[inningsIdx] = inn
      return next
    })
  }
  const removeOverFromBowler = (inningsIdx, bowlerIdx) => {
    setInnings(prev => {
      const next = [...prev]
      const inn = { ...next[inningsIdx] }
      inn.bowling = inn.bowling.map((b, i) => {
        if (i !== bowlerIdx) return b
        const runsPerOver = (b.runsPerOver || []).slice(0, -1)
        return { ...b, runsPerOver, overs: runsPerOver.length }
      })
      next[inningsIdx] = inn
      return next
    })
  }

  // Auto-fill batting team from toss when entering innings steps
  const ensureInningsBattingTeam = (inningsIdx) => {
    if (!innings[inningsIdx].battingTeam) {
      const bt = getBattingTeamForInnings(inningsIdx + 1)
      if (bt) updateInnings(inningsIdx, 'battingTeam', bt)
    }
  }

  const handleStepChange = (newStep) => {
    if (newStep === 2) ensureInningsBattingTeam(0)
    if (newStep === 4) ensureInningsBattingTeam(1)
    setStep(newStep)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      // Enrich batting entries with player names and bowler/fielder names
      const enrichedInnings = innings.map((inn, inningsIdx) => {
        const battingPlayers = getBattingPlayers(inningsIdx + 1)
        const bowlingPlayers = getBowlingPlayers(inningsIdx + 1)
        const allPlayers = getAllPlayers()

        const batting = inn.batting.map(b => {
          const playerObj = battingPlayers.find(p => (p._id || p.id) === b.player) || {}
          const bowlerObj = allPlayers.find(p => (p._id || p.id) === b.bowler) || {}
          const fielderObj = allPlayers.find(p => (p._id || p.id) === b.fielder) || {}
          return {
            ...b,
            name: playerObj.name || b.name || '',
            bowlerName: bowlerObj.name || '',
            fielderName: fielderObj.name || ''
          }
        })

        const bowling = inn.bowling.map(b => {
          const playerObj = bowlingPlayers.find(p => (p._id || p.id) === b.player) || {}
          return { ...b, name: playerObj.name || b.name || '' }
        })

        return {
          battingTeam: inn.battingTeam || getBattingTeamForInnings(inningsIdx + 1),
          batting,
          bowling,
          extras: inn.extras || 0,
          penaltyRuns: inn.penaltyRuns || 0
        }
      })

      const payload = {
        toss,
        innings: enrichedInnings,
        winner: resultData.winner || null,
        resultType: resultData.resultType,
        result: resultData.result || null
      }
      if (isEditing) {
        await matchesApi.updateMatchStats(match._id, payload)
        toast.success('Match stats updated! Player and team stats recalculated.')
      } else {
        await matchesApi.submitMatchStats(match._id, payload)
        toast.success('Match stats submitted! Player and team stats updated.')
      }
      queryClient.invalidateQueries(['admin-matches'])
      queryClient.invalidateQueries(['admin-all-matches'])
      onSuccess?.()
    } catch (error) {
      toast.error('Failed to submit stats: ' + (error?.message || 'Unknown error'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const steps = ['Toss', 'Inn 1 Batting', 'Inn 1 Bowling', 'Inn 2 Batting', 'Inn 2 Bowling', 'Result']

  const renderBattingForm = (inningsIdx) => {
    const battingPlayers = getBattingPlayers(inningsIdx + 1)
    const bowlingPlayers = getBowlingPlayers(inningsIdx + 1)
    const battingData = innings[inningsIdx].batting
    const battingTeamName = getTeamName(innings[inningsIdx].battingTeam || getBattingTeamForInnings(inningsIdx + 1))

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-base">{battingTeamName} - Batting</h4>
          <button type="button" onClick={() => addBatsman(inningsIdx)} className="btn btn-sm btn-outline gap-1">
            <HiPlus className="w-3 h-3" /> Add Batsman
          </button>
        </div>
        {battingData.length === 0 && (
          <p className="text-base-content/50 text-sm text-center py-4">Click "Add Batsman" to start entering batting data</p>
        )}
        {battingData.map((b, idx) => (
          <div key={idx} className="bg-base-200 rounded-lg p-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">#{idx + 1}</span>
              <button type="button" onClick={() => removeBatsman(inningsIdx, idx)} className="btn btn-ghost btn-xs text-error"><HiXMark className="w-3 h-3" /></button>
            </div>
            {/* Player select */}
            <div className="form-control">
              <label className="label py-0"><span className="label-text text-xs">Player</span></label>
              <select value={b.player} onChange={e => updateBatsman(inningsIdx, idx, 'player', e.target.value)} className="select select-bordered select-sm">
                <option value="">Select player</option>
                {battingPlayers.map(p => <option key={p._id || p.id} value={p._id || p.id}>{p.name}</option>)}
              </select>
            </div>
            {/* Runs breakdown */}
            <div>
              <p className="text-xs text-base-content/60 mb-1">Runs scored (count of each)</p>
              <div className="grid grid-cols-6 gap-1">
                {['1s','2s','3s','4s','5s','6s'].map((label, runIdx) => (
                  <div key={label} className="form-control">
                    <label className="label py-0"><span className="label-text text-xs">{label}</span></label>
                    <input type="number" min="0" value={b[['ones','twos','threes','fours','fives','sixes'][runIdx]] || 0}
                      onChange={e => updateBatsman(inningsIdx, idx, ['ones','twos','threes','fours','fives','sixes'][runIdx], Number(e.target.value))}
                      className="input input-bordered input-xs text-center" />
                  </div>
                ))}
              </div>
            </div>
            {/* Balls */}
            <div className="form-control">
              <label className="label py-0"><span className="label-text text-xs">Balls faced</span></label>
              <input type="number" min="0" value={b.balls || 0} onChange={e => updateBatsman(inningsIdx, idx, 'balls', Number(e.target.value))} className="input input-bordered input-sm w-24" />
            </div>
            {/* Dismissal */}
            <div className="grid grid-cols-2 gap-2">
              <div className="form-control">
                <label className="label py-0"><span className="label-text text-xs">How Out?</span></label>
                <select value={b.dismissalType} onChange={e => updateBatsman(inningsIdx, idx, 'dismissalType', e.target.value)} className="select select-bordered select-sm">
                  <option value="">Not Out</option>
                  <option value="caught">Caught</option>
                  <option value="bowled">Bowled</option>
                  <option value="lbw">LBW</option>
                  <option value="run_out">Run Out</option>
                </select>
              </div>
              {(b.dismissalType === 'caught' || b.dismissalType === 'bowled' || b.dismissalType === 'lbw') && (
                <div className="form-control">
                  <label className="label py-0"><span className="label-text text-xs">Bowler</span></label>
                  <select value={b.bowler} onChange={e => updateBatsman(inningsIdx, idx, 'bowler', e.target.value)} className="select select-bordered select-sm">
                    <option value="">Select bowler</option>
                    {bowlingPlayers.map(p => <option key={p._id || p.id} value={p._id || p.id}>{p.name}</option>)}
                  </select>
                </div>
              )}
              {(b.dismissalType === 'caught' || b.dismissalType === 'run_out') && (
                <div className="form-control">
                  <label className="label py-0"><span className="label-text text-xs">{b.dismissalType === 'caught' ? 'Caught by' : 'Fielder'}</span></label>
                  <select value={b.fielder} onChange={e => updateBatsman(inningsIdx, idx, 'fielder', e.target.value)} className="select select-bordered select-sm">
                    <option value="">Select fielder</option>
                    {bowlingPlayers.map(p => <option key={p._id || p.id} value={p._id || p.id}>{p.name}</option>)}
                  </select>
                </div>
              )}
            </div>
          </div>
        ))}
        {/* Extras & Penalty Runs */}
        <div className="bg-base-200 rounded-lg p-3 space-y-2">
          <p className="text-sm font-medium">Innings Totals</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="form-control">
              <label className="label py-0"><span className="label-text text-xs">Extra Runs (Wides, No Balls, Byes, etc.)</span></label>
              <input
                type="number" min="0"
                value={innings[inningsIdx].extras || 0}
                onChange={e => updateInnings(inningsIdx, 'extras', Number(e.target.value))}
                className="input input-bordered input-sm"
              />
            </div>
            <div className="form-control">
              <label className="label py-0"><span className="label-text text-xs">Penalty Runs (given to this team)</span></label>
              <input
                type="number"
                value={innings[inningsIdx].penaltyRuns ?? 0}
                onChange={e => updateInnings(inningsIdx, 'penaltyRuns', e.target.value === '' ? 0 : Number(e.target.value))}
                className="input input-bordered input-sm"
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderBowlingForm = (inningsIdx) => {
    const bowlingPlayers = getBowlingPlayers(inningsIdx + 1)
    const bowlingData = innings[inningsIdx].bowling
    const battingTeamName = getTeamName(innings[inningsIdx].battingTeam || getBattingTeamForInnings(inningsIdx + 1))
    const bowlingTeamId = (innings[inningsIdx].battingTeam || getBattingTeamForInnings(inningsIdx + 1)) === teamAId ? teamBId : teamAId
    const bowlingTeamName = getTeamName(bowlingTeamId)

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-base">{bowlingTeamName} - Bowling (vs {battingTeamName})</h4>
          <button type="button" onClick={() => addBowler(inningsIdx)} className="btn btn-sm btn-outline gap-1">
            <HiPlus className="w-3 h-3" /> Add Bowler
          </button>
        </div>
        {bowlingData.length === 0 && (
          <p className="text-base-content/50 text-sm text-center py-4">Click "Add Bowler" to start entering bowling data</p>
        )}
        {bowlingData.map((b, idx) => (
          <div key={idx} className="bg-base-200 rounded-lg p-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">Bowler #{idx + 1}</span>
              <button type="button" onClick={() => removeBowler(inningsIdx, idx)} className="btn btn-ghost btn-xs text-error"><HiXMark className="w-3 h-3" /></button>
            </div>
            <div className="form-control">
              <label className="label py-0"><span className="label-text text-xs">Player</span></label>
              <select value={b.player} onChange={e => updateBowler(inningsIdx, idx, 'player', e.target.value)} className="select select-bordered select-sm">
                <option value="">Select player</option>
                {bowlingPlayers.map(p => <option key={p._id || p.id} value={p._id || p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="form-control">
                <label className="label py-0"><span className="label-text text-xs">Wickets</span></label>
                <input type="number" min="0" value={b.wickets || 0} onChange={e => updateBowler(inningsIdx, idx, 'wickets', Number(e.target.value))} className="input input-bordered input-sm" />
              </div>
              <div className="form-control">
                <label className="label py-0"><span className="label-text text-xs">Wides</span></label>
                <input type="number" min="0" value={b.wides || 0} onChange={e => updateBowler(inningsIdx, idx, 'wides', Number(e.target.value))} className="input input-bordered input-sm" />
              </div>
              <div className="form-control">
                <label className="label py-0"><span className="label-text text-xs">No Balls</span></label>
                <input type="number" min="0" value={b.noBalls || 0} onChange={e => updateBowler(inningsIdx, idx, 'noBalls', Number(e.target.value))} className="input input-bordered input-sm" />
              </div>
            </div>
            {/* Runs per over */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-base-content/60">Runs per over (excl. wides/no-balls)</p>
                <div className="flex gap-1">
                  <button type="button" onClick={() => addOverToBowler(inningsIdx, idx)} className="btn btn-xs btn-ghost gap-1"><HiPlus className="w-3 h-3" /> Over</button>
                  {(b.runsPerOver || []).length > 0 && <button type="button" onClick={() => removeOverFromBowler(inningsIdx, idx)} className="btn btn-xs btn-ghost text-error">- Over</button>}
                </div>
              </div>
              {(b.runsPerOver || []).length === 0 && <p className="text-xs text-base-content/40">No overs added yet</p>}
              <div className="flex flex-wrap gap-2">
                {(b.runsPerOver || []).map((runs, overIdx) => (
                  <div key={overIdx} className="form-control">
                    <label className="label py-0"><span className="label-text text-xs">Ov {overIdx + 1}</span></label>
                    <input type="number" min="0" value={runs} onChange={e => updateBowlerRunsPerOver(inningsIdx, idx, overIdx, e.target.value)} className="input input-bordered input-xs w-14 text-center" />
                  </div>
                ))}
              </div>
              {(b.runsPerOver || []).length > 0 && (
                <p className="text-xs text-base-content/60 mt-1">
                  Overs: {b.runsPerOver.length} | Runs (excl. extras): {b.runsPerOver.reduce((s, r) => s + r, 0)}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-base-100 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-base-200 bg-gradient-to-r from-hpl-maroon to-hpl-navy">
          <div>
            <h3 className="font-epic font-bold text-lg text-white">{isEditing ? 'Edit Match Stats' : 'Submit Match Stats'}</h3>
            <p className="text-white/70 text-sm">{match?.teamA?.shortName} vs {match?.teamB?.shortName}</p>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle text-white hover:bg-white/20"><HiXMark className="w-5 h-5" /></button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-1 px-4 py-3 bg-base-200 overflow-x-auto">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setStep(i + 1)}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${step === i + 1 ? 'bg-primary text-primary-content' : step > i + 1 ? 'bg-success/20 text-success' : 'bg-base-100 text-base-content/60'}`}
              >
                {step > i + 1 ? '✓ ' : ''}{s}
              </button>
              {i < steps.length - 1 && <HiChevronRight className="w-3 h-3 text-base-content/30 shrink-0" />}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Step 1: Toss */}
          {step === 1 && (
            <div className="space-y-4">
              <h4 className="font-semibold">Toss Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label"><span className="label-text">Toss Won By</span></label>
                  <select value={toss.winner} onChange={e => setToss(prev => ({ ...prev, winner: e.target.value }))} className="select select-bordered">
                    <option value="">Select team</option>
                    <option value={teamAId}>{match?.teamA?.name}</option>
                    <option value={teamBId}>{match?.teamB?.name}</option>
                  </select>
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Decision</span></label>
                  <select value={toss.decision} onChange={e => setToss(prev => ({ ...prev, decision: e.target.value }))} className="select select-bordered">
                    <option value="bat">Elected to Bat</option>
                    <option value="bowl">Elected to Bowl</option>
                  </select>
                </div>
              </div>
              {toss.winner && (
                <div className="bg-base-200 rounded-lg p-3 text-sm">
                  <strong>{getTeamName(toss.winner)}</strong> elected to {toss.decision === 'bat' ? 'bat' : 'bowl'} first.<br/>
                  <span className="text-base-content/60">
                    Innings 1: <strong>{getTeamName(getBattingTeamForInnings(1))}</strong> bats · Innings 2: <strong>{getTeamName(getBattingTeamForInnings(2))}</strong> bats
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Steps 2 & 4: Batting */}
          {(step === 2 || step === 4) && renderBattingForm(step === 2 ? 0 : 1)}

          {/* Steps 3 & 5: Bowling */}
          {(step === 3 || step === 5) && renderBowlingForm(step === 3 ? 0 : 1)}

          {/* Step 6: Result */}
          {step === 6 && (
            <div className="space-y-4">
              <h4 className="font-semibold">Match Result</h4>
              <div className="form-control">
                <label className="label"><span className="label-text">Winner</span></label>
                <select value={resultData.winner} onChange={e => setResultData(prev => ({ ...prev, winner: e.target.value }))} className="select select-bordered">
                  <option value="">Match Tied / No Result</option>
                  <option value={teamAId}>{match?.teamA?.name}</option>
                  <option value={teamBId}>{match?.teamB?.name}</option>
                </select>
              </div>
              {resultData.winner && (
                <div className="form-control">
                  <label className="label"><span className="label-text">Result Type</span></label>
                  <select value={resultData.resultType} onChange={e => setResultData(prev => ({ ...prev, resultType: e.target.value }))} className="select select-bordered">
                    <option value="runs">Won by Runs</option>
                    <option value="wickets">Won by Wickets</option>
                  </select>
                </div>
              )}
              <div className="form-control">
                <label className="label"><span className="label-text">Custom Result Text (optional)</span></label>
                <input type="text" placeholder="e.g. Team A won by 15 runs" value={resultData.result} onChange={e => setResultData(prev => ({ ...prev, result: e.target.value }))} className="input input-bordered" />
                <label className="label"><span className="label-text-alt text-base-content/50">If left blank, result will be auto-generated</span></label>
              </div>

              {/* Summary */}
              <div className="bg-base-200 rounded-lg p-4 space-y-2 text-sm">
                <p className="font-semibold">Summary</p>
                {innings.map((inn, i) => {
                  const battingTeamId = inn.battingTeam || getBattingTeamForInnings(i + 1)
                  const battingRuns = inn.batting.reduce((s, b) => {
                    return s + (b.ones || 0) + 2*(b.twos || 0) + 3*(b.threes || 0) + 4*(b.fours || 0) + 5*(b.fives || 0) + 6*(b.sixes || 0)
                  }, 0)
                  const extras = inn.extras || 0
                  const penalty = inn.penaltyRuns ?? 0
                  const totalRuns = battingRuns + extras + penalty
                  const totalWickets = inn.batting.filter(b => b.dismissalType).length
                  const totalOvers = inn.bowling.reduce((s, b) => s + (b.runsPerOver?.length || 0), 0)
                  const scoreLabel = penalty !== 0
                    ? `${battingRuns + extras}${penalty > 0 ? '+' : ''}${penalty}/${totalWickets}`
                    : `${totalRuns}/${totalWickets}`
                  return (
                    <div key={i}>
                      <span className="text-base-content/60">Innings {i + 1} ({getTeamName(battingTeamId)}): </span>
                      <strong>{scoreLabel}</strong>
                      <span className="text-base-content/60"> ({totalOvers} ov) — {inn.batting.length} batsmen, {inn.bowling.length} bowlers</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-base-200">
          <button type="button" onClick={() => step > 1 ? setStep(step - 1) : onClose()} className="btn btn-ghost">
            {step === 1 ? 'Cancel' : '← Back'}
          </button>
          <div className="flex gap-2">
            {step < 6 ? (
              <button type="button" onClick={() => handleStepChange(step + 1)} className="btn btn-primary">
                Next →
              </button>
            ) : (
              <button type="button" onClick={handleSubmit} disabled={isSubmitting} className="btn btn-success gap-2">
                {isSubmitting ? <span className="loading loading-spinner loading-sm"></span> : <HiCheck className="w-4 h-4" />}
                {isEditing ? 'Update Stats' : 'Submit Match Stats'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const MatchStatsTab = () => {
  const queryClient = useQueryClient()
  const [selectedMatch, setSelectedMatch] = useState(null)
  const [showStatsModal, setShowStatsModal] = useState(false)

  const { data: matchesData, isLoading } = useQuery({
    queryKey: ['admin-all-matches'],
    queryFn: matchesApi.getAllMatches
  })

  const allMatches = matchesData?.data || []

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed': return <span className="badge badge-success">Completed</span>
      case 'live': return <span className="badge badge-error">Live</span>
      case 'scheduled': return <span className="badge badge-info">Scheduled</span>
      default: return <span className="badge">{status}</span>
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-epic font-bold text-2xl">Match Stats</h2>
        <p className="text-base-content/60">Submit post-match statistics — all player and team data updates automatically</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : allMatches.length === 0 ? (
        <div className="text-center py-12 bg-base-100 rounded-xl border border-base-200">
          <HiCalendar className="w-16 h-16 mx-auto text-base-content/20 mb-4" />
          <p className="text-base-content/60">No matches found. Schedule matches first.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {allMatches.filter(m => m.status !== 'completed').map((match) => (
            <motion.div key={match._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-base-100 rounded-xl border border-base-200 p-4"
            >
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {match.teamA?.logo && <img src={match.teamA.logo} alt="" className="w-10 h-10 rounded-lg object-contain bg-white p-1" />}
                    <p className="font-semibold">{match.teamA?.name || 'TBA'}</p>
                  </div>
                  <span className="text-xl font-bold text-base-content/30">VS</span>
                  <div className="flex items-center gap-2">
                    {match.teamB?.logo && <img src={match.teamB.logo} alt="" className="w-10 h-10 rounded-lg object-contain bg-white p-1" />}
                    <p className="font-semibold">{match.teamB?.name || 'TBA'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-sm text-base-content/60">{new Date(match.scheduledAt).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
                  {getStatusBadge(match.status)}
                  <button
                    onClick={() => { setSelectedMatch(match); setShowStatsModal(true) }}
                    className="btn btn-primary btn-sm gap-1"
                  >
                    <HiChartBar className="w-4 h-4" /> Enter Stats
                  </button>
                </div>
              </div>
            </motion.div>
          ))}

          {allMatches.filter(m => m.status === 'completed').length > 0 && (
            <>
              <div className="divider text-base-content/40 text-sm">Completed Matches</div>
              {allMatches.filter(m => m.status === 'completed').map((match) => (
                <motion.div key={match._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="bg-base-100 rounded-xl border border-base-200 p-4"
                >
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <p className="font-semibold">{match.teamA?.name}</p>
                      <span className="text-base-content/30">vs</span>
                      <p className="font-semibold">{match.teamB?.name}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="badge badge-success">Completed</span>
                      {match.result && <p className="text-sm text-base-content/60 italic">{match.result}</p>}
                      <button
                        onClick={() => { setSelectedMatch(match); setShowStatsModal(true) }}
                        className="btn btn-outline btn-sm gap-1"
                      >
                        <HiPencilSquare className="w-4 h-4" /> Edit Stats
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </>
          )}
        </div>
      )}

      {showStatsModal && selectedMatch && (
        <MatchStatsFormModal
          match={selectedMatch}
          onClose={() => setShowStatsModal(false)}
          onSuccess={() => { setShowStatsModal(false); setSelectedMatch(null) }}
        />
      )}
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
    if (!confirm('This will recalculate all player stats from completed match data. Continue?')) return
    
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
    { id: 'match-stats', label: 'Match Stats', icon: HiChartBar },
    { id: 'standings', label: 'Standings', icon: HiTableCells },
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
            {activeTab === 'matches' && <MatchesTab />}
            {activeTab === 'match-stats' && <MatchStatsTab />}
            {activeTab === 'standings' && <StatsTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default Admin
