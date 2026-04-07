const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'
const USE_MOCK = import.meta.env.VITE_USE_MOCK_SOCKET === 'true'

class SocketService {
  constructor() {
    this.listeners = new Map()
    this.isConnected = false
    this.socket = null
  }

  connect() {
    if (this.isConnected && this.socket?.connected) return this

    if (USE_MOCK) {
      this.isConnected = true
      return this
    }

    import('socket.io-client').then(({ io }) => {
      if (this.socket?.connected) return

      this.socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        timeout: 20000
      })

      this.socket.on('connect', () => {
        this.isConnected = true
        this.emit('connect', { connected: true })
      })

      this.socket.on('disconnect', (reason) => {
        this.isConnected = false
        this.emit('disconnect', { connected: false, reason })
      })

      this.socket.on('match:completed', (data) => this.emit('match:completed', data))
    }).catch(err => {
      console.error('[Socket] Failed to load socket.io-client:', err)
    })

    return this
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
    this.isConnected = false
  }

  on(event, callback) {
    if (!this.listeners.has(event)) this.listeners.set(event, [])
    this.listeners.get(event).push(callback)
    return this
  }

  off(event, callback) {
    if (!this.listeners.has(event)) return
    const callbacks = this.listeners.get(event)
    const index = callbacks.indexOf(callback)
    if (index > -1) callbacks.splice(index, 1)
    return this
  }

  emit(event, data) {
    if (!this.listeners.has(event)) return
    this.listeners.get(event).forEach(cb => cb(data))
  }
}

export const socketService = new SocketService()
export default socketService
