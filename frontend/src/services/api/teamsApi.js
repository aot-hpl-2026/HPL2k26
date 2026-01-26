// Teams API Service - Connects to backend with mock fallback

import { api } from './apiBase'
import { teams, getTeamById as getTeam, getPointsTable as getTable } from '../../data/mock'

// Use mock data if backend is unavailable
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

export const teamsApi = {
  // Get all teams
  getAllTeams: async () => {
    if (USE_MOCK) return { data: teams, success: true }
    
    const result = await api.get('/teams')
    if (!result.success) return { data: teams, success: true }
    return result
  },

  // Get team by ID
  getTeamById: async (teamId) => {
    if (USE_MOCK) {
      const team = getTeam(teamId)
      return team ? { data: team, success: true } : { data: null, success: false }
    }
    
    const result = await api.get(`/teams/${teamId}`)
    if (!result.success) {
      const team = getTeam(teamId)
      return team ? { data: team, success: true } : { data: null, success: false }
    }
    return result
  },

  // Get points table
  getPointsTable: async () => {
    if (USE_MOCK) return { data: getTable(), success: true }
    
    const result = await api.get('/teams/points-table')
    if (!result.success) return { data: getTable(), success: true }
    return result
  },

  // Create team (Admin only)
  createTeam: async (teamData) => {
    const result = await api.post('/teams', teamData)
    if (!result.success) {
      throw new Error(result.error || 'Failed to create team')
    }
    return result
  },

  // Update team (Admin only)
  updateTeam: async (teamId, teamData) => {
    const result = await api.put(`/teams/${teamId}`, teamData)
    if (!result.success) {
      throw new Error(result.error || 'Failed to update team')
    }
    return result
  },

  // Update team stats (Admin only)
  updateTeamStats: async (teamId, statsData) => {
    const result = await api.put(`/teams/${teamId}/stats`, statsData)
    if (!result.success) {
      throw new Error(result.error || 'Failed to update team stats')
    }
    return result
  },

  // Delete team (Admin only)
  deleteTeam: async (teamId) => {
    const result = await api.delete(`/teams/${teamId}`)
    if (!result.success) {
      throw new Error(result.error || 'Failed to delete team')
    }
    return result
  },
}

export default teamsApi
