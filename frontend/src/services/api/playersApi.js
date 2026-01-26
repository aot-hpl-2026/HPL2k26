// Players API Service - Connects to backend with mock fallback

import { api } from './apiBase'
import { 
  players, 
  getPlayerById as getPlayer, 
  getPlayersByTeam as getByTeam,
  getTopBatsmen as topBats,
  getTopBowlers as topBowls
} from '../../data/mock'

// Use mock data if backend is unavailable
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

export const playersApi = {
  // Get all players
  getAllPlayers: async () => {
    if (USE_MOCK) return { data: players, success: true }
    
    const result = await api.get('/players')
    if (!result.success) return { data: players, success: true }
    return result
  },

  // Get player by ID
  getPlayerById: async (playerId) => {
    if (USE_MOCK) {
      const player = getPlayer(playerId)
      return player ? { data: player, success: true } : { data: null, success: false }
    }
    
    const result = await api.get(`/players/${playerId}`)
    if (!result.success) {
      const player = getPlayer(playerId)
      return player ? { data: player, success: true } : { data: null, success: false }
    }
    return result
  },

  // Get players by team
  getPlayersByTeam: async (teamId) => {
    if (USE_MOCK) return { data: getByTeam(teamId), success: true }
    
    const result = await api.get(`/players?team=${teamId}`)
    if (!result.success) return { data: getByTeam(teamId), success: true }
    return result
  },

  // Get top batsmen
  getTopBatsmen: async (limit = 5) => {
    if (USE_MOCK) return { data: topBats(limit), success: true }
    
    const result = await api.get(`/players/top-batsmen?limit=${limit}`)
    if (!result.success) return { data: topBats(limit), success: true }
    return result
  },

  // Get top bowlers
  getTopBowlers: async (limit = 5) => {
    if (USE_MOCK) return { data: topBowls(limit), success: true }
    
    const result = await api.get(`/players/top-bowlers?limit=${limit}`)
    if (!result.success) return { data: topBowls(limit), success: true }
    return result
  },

  // Create player (Admin only)
  createPlayer: async (playerData) => {
    const result = await api.post('/players', playerData)
    if (!result.success) {
      throw new Error(result.error || 'Failed to create player')
    }
    return result
  },

  // Update player (Admin only)
  updatePlayer: async (playerId, playerData) => {
    const result = await api.put(`/players/${playerId}`, playerData)
    if (!result.success) {
      throw new Error(result.error || 'Failed to update player')
    }
    return result
  },

  // Update player stats (Admin only)
  updatePlayerStats: async (playerId, statsData) => {
    const result = await api.put(`/players/${playerId}/stats`, statsData)
    if (!result.success) {
      throw new Error(result.error || 'Failed to update player stats')
    }
    return result
  },

  // Delete player (Admin only)
  deletePlayer: async (playerId) => {
    const result = await api.delete(`/players/${playerId}`)
    if (!result.success) {
      throw new Error(result.error || 'Failed to delete player')
    }
    return result
  },

  // Recalculate all player stats from Ball collection (Admin only)
  recalculateAllStats: async () => {
    const result = await api.post('/stats/recalculate')
    if (!result.success) {
      throw new Error(result.error || 'Failed to recalculate stats')
    }
    return result
  },
}

export default playersApi
