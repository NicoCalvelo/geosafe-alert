import type { ApplicationService } from '@adonisjs/core/types'
import { Server } from 'socket.io'

let io: Server

/**
 * Provider pour initialiser Socket.IO sur le serveur HTTP d'AdonisJS.
 * Utilise l'export `getWsServer()` pour l'accès dans les contrôleurs.
 */
export default class WsProvider {
  constructor(protected app: ApplicationService) {}

  async boot() {
    // On ne démarre Socket.IO qu'en mode web (pas en ace commands / tests)
    if (this.app.getEnvironment() !== 'web') return
  }

  async ready() {
    if (this.app.getEnvironment() !== 'web') return

    const server = await this.app.container.make('server')
    const httpServer = server.getNodeServer()
    if (!httpServer) return

    io = new Server(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    })

    io.of('/events').on('connection', (socket) => {
      console.log(`[WS] Client connected to /events: ${socket.id}`)
      socket.on('disconnect', () => {
        console.log(`[WS] Client disconnected: ${socket.id}`)
      })
    })
  }

  async shutdown() {
    if (io) {
      io.close()
    }
  }
}

/**
 * Retourne l'instance Socket.IO server.
 * À utiliser dans les contrôleurs pour émettre des événements.
 */
export function getWsServer(): Server | null {
  return io ?? null
}
