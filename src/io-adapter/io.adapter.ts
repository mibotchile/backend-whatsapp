import { IoAdapter } from '@nestjs/platform-socket.io'
import { Server } from 'socket.io'

export class ExtendedSocketIoAdapter extends IoAdapter {
  protected ioServer: Server

  constructor(protected server: any) {
    super()

    const options = {
      cors: {
        origin: true,
        methods: ['GET', 'POST'],
        credentials: true
      }
    }

    this.ioServer = new Server(server, options)
  }

  create (port: number) {
    console.log('websocket gateway port argument is ignored by ExtendedSocketIoAdapter, use the same port of http instead')
    return this.ioServer
  }
}
