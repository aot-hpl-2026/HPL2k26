// Custom hook for live score subscription
import { useEffect, useState, useCallback, useRef } from 'react'
import { socketService } from '../services/socket'
import { matchesApi } from '../services/api'

export const useLiveScore = (matchId, initialScore = null) => {
  const [score, setScore] = useState(initialScore)
  const [lastBall, setLastBall] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [recentBalls, setRecentBalls] = useState([])
  const [currentBatsmen, setCurrentBatsmen] = useState([])
  const [currentBowler, setCurrentBowler] = useState(null)
  const [innings, setInnings] = useState([])
  const [target, setTarget] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  
  const matchIdRef = useRef(matchId)
  matchIdRef.current = matchId

  // Fetch initial live state from API
  const fetchLiveState = useCallback(async () => {
    if (!matchId) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await matchesApi.getFullLiveState(matchId)
      
      if (result.success && result.data) {
        const data = result.data
        
        // Only update if this is still the current match
        if (matchIdRef.current === matchId) {
          if (data.score) setScore(data.score)
          if (data.currentBatsmen) setCurrentBatsmen(data.currentBatsmen)
          if (data.currentBowler) setCurrentBowler(data.currentBowler)
          if (data.recentBalls) setRecentBalls(data.recentBalls)
          if (data.innings) setInnings(data.innings)
          if (data.target) setTarget(data.target)
          setLastUpdated(new Date())
        }
      }
    } catch (err) {
      console.error('[useLiveScore] Failed to fetch live state:', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [matchId])

  useEffect(() => {
    if (!matchId) {
      setIsLoading(false)
      return
    }

    // Fetch initial state from API
    fetchLiveState()

    // Connect and join match
    socketService.connect()
    socketService.joinMatch(matchId)

    const handleConnect = () => {
      setIsConnected(true)
      // Refetch state on reconnect
      fetchLiveState()
    }
    
    const handleDisconnect = () => setIsConnected(false)
    
    const handleScoreUpdate = (data) => {
      // Check if this update is for our match
      if (data.matchId !== matchId && data.matchId !== matchIdRef.current) return
      
      // Update score
      if (data.score) {
        setScore(data.score)
      }
      
      // Update last ball
      if (data.lastBall) {
        const ballDisplay = typeof data.lastBall === 'object' 
          ? (data.lastBall.wicket ? 'W' : data.lastBall.runsOffBat?.toString() || '0')
          : data.lastBall
        setLastBall(ballDisplay)
      }
      
      // Update recent balls from server
      if (data.recentBalls && Array.isArray(data.recentBalls)) {
        setRecentBalls(data.recentBalls.slice(-8))
      }
      
      // Update current batsmen
      if (data.currentBatsmen) {
        setCurrentBatsmen(data.currentBatsmen)
      }
      
      // Update current bowler
      if (data.currentBowler) {
        setCurrentBowler(data.currentBowler)
      }
      
      // Update innings
      if (data.innings) {
        setInnings(data.innings)
      }
      
      // Update target
      if (data.target !== undefined) {
        setTarget(data.target)
      }
      
      setLastUpdated(new Date())
    }

    socketService.on('connect', handleConnect)
    socketService.on('disconnect', handleDisconnect)
    socketService.on('score:update', handleScoreUpdate)

    // Auto-refresh every 30 seconds as fallback in case socket misses updates
    const autoRefreshInterval = setInterval(() => {
      const status = socketService.getConnectionStatus()
      if (!status.public) {
        console.log('[useLiveScore] Socket disconnected, fetching via API')
        fetchLiveState()
      }
    }, 30000)

    return () => {
      socketService.off('connect', handleConnect)
      socketService.off('disconnect', handleDisconnect)
      socketService.off('score:update', handleScoreUpdate)
      socketService.leaveMatch(matchId)
      clearInterval(autoRefreshInterval)
    }
  }, [matchId, fetchLiveState])

  // Force refresh function for manual refresh
  const refresh = useCallback(() => {
    fetchLiveState()
  }, [fetchLiveState])

  return { 
    score, 
    lastBall, 
    isConnected, 
    recentBalls,
    currentBatsmen,
    currentBowler,
    innings,
    target,
    isLoading,
    error,
    refresh,
    lastUpdated
  }
}
