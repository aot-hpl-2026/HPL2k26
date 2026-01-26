// Socket Service for Live Score Updates
// Supports both mock mode (for development) and real Socket.IO

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'
const USE_MOCK = import.meta.env.VITE_USE_MOCK_SOCKET === 'true'

class SocketService {
  constructor() {
    this.listeners = new Map()
    this.isConnected = false
    this.publicSocket = null
    this.adminSocket = null
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectDelay = 1000
  }

  // Connect to public socket (for live updates)
  connect() {
    if (this.isConnected && this.publicSocket?.connected) return

    if (USE_MOCK) {
      console.log('[Socket] Mock mode - not connecting to server')
      this.isConnected = true
      setTimeout(() => {
        this.emit('connect', { connected: true })
      }, 100)
      return this
    }

    // Real Socket.IO connection
    import('socket.io-client').then(({ io }) => {
      if (this.publicSocket?.connected) return

      this.publicSocket = io(`${SOCKET_URL}/public`, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
        timeout: 20000
      })

      this.publicSocket.on('connect', () => {
        console.log('[Socket] Connected to public namespace')
        this.isConnected = true
        this.reconnectAttempts = 0
        this.emit('connect', { connected: true })
      })

      this.publicSocket.on('disconnect', (reason) => {
        console.log('[Socket] Disconnected from public namespace:', reason)
        this.isConnected = false
        this.emit('disconnect', { connected: false, reason })
      })

      this.publicSocket.on('connect_error', (error) => {
        console.error('[Socket] Connection error:', error.message)
        this.reconnectAttempts++
      })

      this.publicSocket.on('score:update', (data) => {
        console.log('[Socket] Received score update:', data.matchId)
        this.emit('score:update', data)
      })

      this.publicSocket.on('match:started', (data) => {
        console.log('[Socket] Match started:', data.matchId)
        this.emit('match:started', data)
      })

      this.publicSocket.on('innings:started', (data) => {
        console.log('[Socket] Innings started:', data.matchId)
        this.emit('innings:started', data)
      })
    }).catch(err => {
      console.error('[Socket] Failed to load socket.io-client:', err)
    })

    return this
  }

  // Connect to admin socket (for scoring)
  connectAdmin(token) {
    if (USE_MOCK) {
      console.log('[Socket] Admin connected (mock mode)')
      return Promise.resolve(true)
    }

    return import('socket.io-client').then(({ io }) => {
      return new Promise((resolve, reject) => {
        if (this.adminSocket?.connected) {
          resolve(true)
          return
        }

        this.adminSocket = io(`${SOCKET_URL}/admin`, {
          auth: { token },
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionAttempts: this.maxReconnectAttempts,
          reconnectionDelay: this.reconnectDelay,
          timeout: 20000
        })

        this.adminSocket.on('connect', () => {
          console.log('[Socket] Connected to admin namespace')
          resolve(true)
        })

        this.adminSocket.on('connect_error', (err) => {
          console.error('[Socket] Admin connection error:', err.message)
          reject(err)
        })

        this.adminSocket.on('disconnect', (reason) => {
          console.log('[Socket] Admin disconnected:', reason)
        })
      })
    })
  }

  // Disconnect admin socket
  disconnectAdmin() {
    if (this.adminSocket) {
      this.adminSocket.disconnect()
      this.adminSocket = null
    }
  }

  // Send score update (admin only)
  sendScoreUpdate(matchId, ball) {
    return new Promise((resolve, reject) => {
      if (USE_MOCK) {
        console.log('[Socket] Mock score update:', matchId, ball)
        // In mock mode, just resolve
        resolve({ success: true, data: { match: {}, ball } })
        return
      }

      if (!this.adminSocket?.connected) {
        reject(new Error('Admin socket not connected'))
        return
      }

      this.adminSocket.emit('score:update', { matchId, ball }, (response) => {
        if (response.success) {
          resolve(response)
        } else {
          reject(new Error(response.message || 'Score update failed'))
        }
      })
    })
  }

  // Save scoring state (admin only)
  saveScoringState(matchId, state) {
    return new Promise((resolve, reject) => {
      if (USE_MOCK) {
        console.log('[Socket] Mock save scoring state:', matchId)
        resolve({ success: true })
        return
      }

      if (!this.adminSocket?.connected) {
        reject(new Error('Admin socket not connected'))
        return
      }

      this.adminSocket.emit('scoring:save', { matchId, state }, (response) => {
        if (response?.success) {
          resolve(response)
        } else {
          reject(new Error(response?.message || 'Failed to save scoring state'))
        }
      })
    })
  }

  // Disconnect from socket
  disconnect() {
    if (!this.isConnected) return

    console.log('[Socket] Disconnecting...')
    this.isConnected = false

    if (this.publicSocket) {
      this.publicSocket.disconnect()
      this.publicSocket = null
    }

    this.emit('disconnect', { connected: false })
  }

  // Subscribe to an event
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event).push(callback)
    return this
  }

  // Unsubscribe from an event
  off(event, callback) {
    if (!this.listeners.has(event)) return
    const callbacks = this.listeners.get(event)
    const index = callbacks.indexOf(callback)
    if (index > -1) {
      callbacks.splice(index, 1)
    }
    return this
  }

  // Emit an event to all listeners
  emit(event, data) {
    if (!this.listeners.has(event)) return
    this.listeners.get(event).forEach(callback => callback(data))
  }

  // Join a match room
  joinMatch(matchId) {
    console.log('[Socket] Joining match room:', matchId)
    
    if (!USE_MOCK && this.publicSocket?.connected) {
      this.publicSocket.emit('subscribe', matchId)
    }
    
    this.emit('match:joined', { matchId })
  }

  // Leave a match room
  leaveMatch(matchId) {
    console.log('[Socket] Leaving match room:', matchId)
    
    if (!USE_MOCK && this.publicSocket?.connected) {
      this.publicSocket.emit('unsubscribe', matchId)
    }
    
    this.emit('match:left', { matchId })
  }

  // Check connection status
  getConnectionStatus() {
    return {
      public: this.publicSocket?.connected || false,
      admin: this.adminSocket?.connected || false,
      isConnected: this.isConnected
    }
  }
}

// Singleton instance
export const socketService = new SocketService()

export default socketService
