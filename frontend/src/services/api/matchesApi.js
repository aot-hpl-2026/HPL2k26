// Matches API Service - Connects to backend with mock fallback

import { api } from './apiBase'
import { 
  matches, 
  getMatchById as getMatch,
  getLiveMatches as getLive,
  getUpcomingMatches as getUpcoming,
  getCompletedMatches as getCompleted,
  getMatchesByTeam as getByTeam
} from '../../data/mock'

// Use mock data if backend is unavailable
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

export const matchesApi = {
  // Get all matches
  getAllMatches: async () => {
    if (USE_MOCK) return { data: matches, success: true }
    
    const result = await api.get('/matches')
    if (!result.success) return { data: matches, success: true } // Fallback to mock
    return result
  },

  // Get match by ID
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

  // Get live matches
  getLiveMatches: async () => {
    if (USE_MOCK) return { data: getLive(), success: true }
    
    const result = await api.get('/matches/live')
    if (!result.success) return { data: getLive(), success: true }
    return result
  },

  // Get upcoming matches
  getUpcomingMatches: async () => {
    if (USE_MOCK) return { data: getUpcoming(), success: true }
    
    const result = await api.get('/matches/upcoming')
    if (!result.success) return { data: getUpcoming(), success: true }
    return result
  },

  // Get completed matches
  getCompletedMatches: async () => {
    if (USE_MOCK) return { data: getCompleted(), success: true }
    
    const result = await api.get('/matches/completed')
    if (!result.success) return { data: getCompleted(), success: true }
    return result
  },

  // Get matches by team
  getMatchesByTeam: async (teamId) => {
    if (USE_MOCK) return { data: getByTeam(teamId), success: true }
    
    const result = await api.get(`/matches/team/${teamId}`)
    if (!result.success) return { data: getByTeam(teamId), success: true }
    return result
  },

  // Get live score from cache
  getLiveScore: async (matchId) => {
    return await api.get(`/matches/${matchId}/live`)
  },

  // Get full live state (for refreshing viewers)
  getFullLiveState: async (matchId) => {
    return await api.get(`/matches/${matchId}/live-state`)
  },

  // Get scoring state (for admin resuming scoring)
  getScoringState: async (matchId) => {
    return await api.get(`/matches/${matchId}/scoring-state`)
  },

  // Save scoring state (for admin progress)
  saveScoringState: async (matchId, state) => {
    return await api.post(`/matches/${matchId}/scoring-state`, state)
  },

  // Complete match (update stats, clear cache)
  completeMatch: async (matchId, { winner, result, resultType }) => {
    const res = await api.post(`/matches/${matchId}/complete`, { winner, result, resultType })
    if (!res.success) {
      throw new Error(res.error || 'Failed to complete match')
    }
    return res
  },

  // Create match (Admin only)
  createMatch: async (matchData) => {
    const result = await api.post('/matches', matchData)
    if (!result.success) {
      throw new Error(result.error || 'Failed to create match')
    }
    return result
  },

  // Update match (Admin only)
  updateMatch: async (matchId, matchData) => {
    const result = await api.put(`/matches/${matchId}`, matchData)
    if (!result.success) {
      throw new Error(result.error || 'Failed to update match')
    }
    return result
  },

  // Delete match (Admin only)
  deleteMatch: async (matchId) => {
    const result = await api.delete(`/matches/${matchId}`)
    if (!result.success) {
      throw new Error(result.error || 'Failed to delete match')
    }
    return result
  },

  // Update live score (Admin only)
  updateScore: async (matchId, scoreData) => {
    const result = await api.post(`/matches/${matchId}/score`, scoreData)
    if (!result.success) {
      throw new Error(result.error || 'Failed to update score')
    }
    return result
  },

  // Start innings - saves toss, openers, and bowler (Admin only)
  startInnings: async (matchId, inningsData) => {
    const result = await api.post(`/matches/${matchId}/start-innings`, inningsData)
    if (!result.success) {
      throw new Error(result.error || 'Failed to start innings')
    }
    return result
  },

  // End innings - saves final innings data and updates player stats (Admin only)
  endInnings: async (matchId, inningsData, inningsNumber) => {
    const result = await api.post(`/matches/${matchId}/end-innings`, { 
      inningsData, 
      inningsNumber 
    })
    if (!result.success) {
      throw new Error(result.error || 'Failed to end innings')
    }
    return result
  },

  // Change bowler (Admin only)
  changeBowler: async (matchId, bowlerData) => {
    const result = await api.post(`/matches/${matchId}/change-bowler`, bowlerData)
    if (!result.success) {
      throw new Error(result.error || 'Failed to change bowler')
    }
    return result
  },

  // Add new batsman after wicket (Admin only)
  newBatsman: async (matchId, batsmanData) => {
    const result = await api.post(`/matches/${matchId}/new-batsman`, batsmanData)
    if (!result.success) {
      throw new Error(result.error || 'Failed to add new batsman')
    }
    return result
  },
}

export default matchesApi
