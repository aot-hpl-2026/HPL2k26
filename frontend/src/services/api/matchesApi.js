import { api } from './apiBase'
import {
  matches,
  getMatchById as getMatch,
  getLiveMatches as getLive,
  getUpcomingMatches as getUpcoming,
  getCompletedMatches as getCompleted,
  getMatchesByTeam as getByTeam
} from '../../data/mock'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

export const matchesApi = {
  getAllMatches: async () => {
    if (USE_MOCK) return { data: matches, success: true }
    const result = await api.get('/matches')
    if (!result.success) return { data: matches, success: true }
    return result
  },

  getMatchById: async (matchId) => {
    if (USE_MOCK) {
      const match = getMatch(matchId)
      return match ? { data: match, success: true } : { data: null, success: false }
    }
    const result = await api.get(`/matches/${matchId}`)
    if (!result.success) {
      const match = getMatch(matchId)
      return match ? { data: match, success: true } : { data: null, success: false }
    }
    return result
  },

  getLiveMatches: async () => {
    if (USE_MOCK) return { data: getLive(), success: true }
    const result = await api.get('/matches/live')
    if (!result.success) return { data: getLive(), success: true }
    return result
  },

  getUpcomingMatches: async () => {
    if (USE_MOCK) return { data: getUpcoming(), success: true }
    const result = await api.get('/matches/upcoming')
    if (!result.success) return { data: getUpcoming(), success: true }
    return result
  },

  getCompletedMatches: async () => {
    if (USE_MOCK) return { data: getCompleted(), success: true }
    const result = await api.get('/matches/completed')
    if (!result.success) return { data: getCompleted(), success: true }
    return result
  },

  getMatchesByTeam: async (teamId) => {
    if (USE_MOCK) return { data: getByTeam(teamId), success: true }
    const result = await api.get(`/matches/team/${teamId}`)
    if (!result.success) return { data: getByTeam(teamId), success: true }
    return result
  },

  // Create match (Admin only)
  createMatch: async (matchData) => {
    const result = await api.post('/matches', matchData)
    if (!result.success) throw new Error(result.error || 'Failed to create match')
    return result
  },

  // Update match (Admin only)
  updateMatch: async (matchId, matchData) => {
    const result = await api.put(`/matches/${matchId}`, matchData)
    if (!result.success) throw new Error(result.error || 'Failed to update match')
    return result
  },

  // Delete match (Admin only)
  deleteMatch: async (matchId) => {
    const result = await api.delete(`/matches/${matchId}`)
    if (!result.success) throw new Error(result.error || 'Failed to delete match')
    return result
  },

  // Submit match stats after a match is played (Admin only)
  // Automatically calculates and updates all player/team stats
  submitMatchStats: async (matchId, statsData) => {
    const result = await api.post(`/matches/${matchId}/stats`, statsData)
    if (!result.success) throw new Error(result.error || 'Failed to submit match stats')
    return result
  },
}

export default matchesApi
