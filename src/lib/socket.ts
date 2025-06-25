import * as ISocket from '@/types/socket'
import { io, Socket } from 'socket.io-client'
import { eventBus } from './event'

export interface SocketConfig {
  serverUrl?: string
  autoConnect?: boolean
}

export class SocketIOManager {
  private socket: Socket | null = null
  private connected = false
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private maxReconnectDelay = 30000
  private connectionState: 'disconnected' | 'connecting' | 'connected' | 'reconnecting' = 'disconnected'
  private heartbeatInterval: NodeJS.Timeout | null = null
  private connectionTimeout: NodeJS.Timeout | null = null

  constructor(private config: SocketConfig = {}) {
    // Temporarily disable auto-connect until WebSocket backend is available
    // if (config.autoConnect !== false) {
    //   this.connect()
    // }
    console.log('🔌 SocketIOManager initialized but auto-connect disabled (using HTTP APIs instead)')
  }

  connect(serverUrl?: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      // WebSocket disabled - using HTTP APIs instead
      console.log('🔌 WebSocket connection disabled, using HTTP APIs instead')
      this.connectionState = 'disconnected'
      resolve(false)
      return

      this.socket = io(url, {
        transports: ['polling', 'websocket'],
        upgrade: true,
        reconnection: false, // Handle reconnection manually for better control
        timeout: 5000,
        forceNew: true,
      })

      this.socket.on('connect', () => {
        console.log('✅ Socket.IO connected:', this.socket?.id)
        this.connected = true
        this.connectionState = 'connected'
        this.reconnectAttempts = 0
        this.clearTimers()
        this.startHeartbeat()
        resolve(true)
      })

      this.socket.on('connect_error', (error) => {
        console.error('❌ Socket.IO connection error:', error)
        this.connected = false
        this.connectionState = 'disconnected'
        this.clearTimers()
        
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect()
        } else {
          reject(
            new Error(
              `Failed to connect after ${this.maxReconnectAttempts} attempts`
            )
          )
        }
      })

      this.socket.on('disconnect', (reason) => {
        console.log('🔌 Socket.IO disconnected:', reason)
        this.connected = false
        this.connectionState = 'disconnected'
        this.clearTimers()
        
        // Auto-reconnect on unexpected disconnections
        if (reason === 'io server disconnect') {
          // Server initiated disconnect, don't reconnect
          console.log('🚫 Server initiated disconnect, not reconnecting')
        } else {
          // Client-side disconnect or transport error, attempt reconnect
          this.scheduleReconnect()
        }
      })

      this.registerEventHandlers()
    })
  }

  private registerEventHandlers() {
    if (!this.socket) return

    this.socket.on('connected', (data) => {
      console.log('🔗 Socket.IO connection confirmed:', data)
    })

    this.socket.on('init_done', (data) => {
      console.log('🔗 Server initialization done:', data)
    })

    this.socket.on('session_update', (data) => {
      this.handleSessionUpdate(data)
    })

    this.socket.on('pong', (data) => {
      console.log('🔗 Pong received:', data)
    })
  }

  private handleSessionUpdate(data: ISocket.SessionUpdateEvent) {
    const { session_id, type } = data

    if (!session_id) {
      console.warn('⚠️ Session update missing session_id:', data)
      return
    }

    switch (type) {
      case ISocket.SessionEventType.Delta:
        eventBus.emit('Socket::Session::Delta', data)
        break
      case ISocket.SessionEventType.ToolCall:
        eventBus.emit('Socket::Session::ToolCall', data)
        break
      case ISocket.SessionEventType.ToolCallArguments:
        eventBus.emit('Socket::Session::ToolCallArguments', data)
        break
      case ISocket.SessionEventType.ToolCallProgress:
        eventBus.emit('Socket::Session::ToolCallProgress', data)
        break
      case ISocket.SessionEventType.ImageGenerated:
        eventBus.emit('Socket::Session::ImageGenerated', data)
        break
      case ISocket.SessionEventType.AllMessages:
        eventBus.emit('Socket::Session::AllMessages', data)
        break
      case ISocket.SessionEventType.Done:
        eventBus.emit('Socket::Session::Done', data)
        break
      case ISocket.SessionEventType.Error:
        eventBus.emit('Socket::Session::Error', data)
        break
      case ISocket.SessionEventType.Info:
        eventBus.emit('Socket::Session::Info', data)
        break
      default:
        console.log('⚠️ Unknown session update type:', type)
    }
  }

  private clearTimers() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout)
      this.connectionTimeout = null
    }
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.connected && this.socket) {
        this.socket.emit('ping', { timestamp: Date.now() })
      }
    }, 30000) // Ping every 30 seconds
  }

  private scheduleReconnect() {
    if (this.connectionState === 'reconnecting') {
      return // Already reconnecting
    }

    this.connectionState = 'reconnecting'
    this.reconnectAttempts++
    
    // Exponential backoff with jitter
    const baseDelay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
      this.maxReconnectDelay
    )
    const jitter = Math.random() * 1000
    const delay = baseDelay + jitter

    console.log(`🔄 Scheduling reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${Math.round(delay)}ms`)

    setTimeout(() => {
      if (this.reconnectAttempts <= this.maxReconnectAttempts) {
        this.connect().catch((error) => {
          console.error('❌ Reconnection failed:', error)
          if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('💀 Max reconnection attempts reached, giving up')
            this.connectionState = 'disconnected'
          }
        })
      }
    }, delay)
  }

  ping(data: unknown) {
    // WebSocket disabled - using HTTP APIs instead
    console.log('🔌 WebSocket ping skipped (using HTTP APIs)')
    return
  }

  disconnect() {
    this.clearTimers()
    if (this.socket) {
      this.socket.disconnect()
      this.socket.removeAllListeners()
      this.socket = null
      this.connected = false
      this.connectionState = 'disconnected'
      console.log('🔌 Socket.IO manually disconnected')
    }
  }

  forceReconnect() {
    console.log('🔄 Forcing reconnection...')
    this.reconnectAttempts = 0
    this.disconnect()
    return this.connect()
  }

  isConnected(): boolean {
    // WebSocket disabled - always return false
    return false
  }

  getConnectionState(): string {
    return this.connectionState
  }

  getReconnectAttempts(): number {
    return this.reconnectAttempts
  }

  getSocketId(): string | undefined {
    return this.socket?.id
  }

  getSocket(): Socket | null {
    return this.socket
  }
}

export const socketManager = new SocketIOManager({
  serverUrl: import.meta.env.VITE_JAAZ_WEBSOCKET_URL || 'ws://localhost:8080',
})
