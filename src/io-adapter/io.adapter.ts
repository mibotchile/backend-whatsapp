import { IoAdapter } from '@nestjs/platform-socket.io'
import { Server } from 'socket.io'
import * as https from 'node:https'
import * as http from 'node:http'
import * as fs from 'node:fs'
import { IOAuthenticationMiddleware } from './io-auth.middleware'
import { DataSource } from 'typeorm'
import { InjectDataSource } from '@nestjs/typeorm'
import { IoSocketsRepository } from './io-sockets-repository'

export class ExtendedSocketIoAdapter extends IoAdapter {
  protected ioServer: Server
  protected httpsServer:https.Server|http.Server
  @InjectDataSource('default') dataSource:DataSource

  constructor() {
    super()
    console.log('Datasources', this.dataSource)

    console.log('SE LLAMO AL CONTRUCTOR DEL IO ADAPTER')
    const options = {
      cors: {
        origin: true,
        methods: ['GET', 'POST'],
        credentials: true
      },
      allowEIO3: true
    }

    if ((process.env.SSL && process.env.SSL === 'true') || process.env.NODE_ENV === 'production') {
      console.log('SSL ENABLED IN WEBSOCKET')
      const httpsOptions = {
        key: fs.readFileSync(process.env.SSL_KEY),
        cert: fs.readFileSync(process.env.SSL_CERT)
      }
      this.httpsServer = https.createServer(httpsOptions)
    } else {
      this.httpsServer = http.createServer()
    }

    this.ioServer = new Server(this.httpsServer, options)
    const authMidleware = new IOAuthenticationMiddleware()

    this.ioServer.use(async (socket, next) => {
      console.log('[ ====== MIDLEWARE ====== ]', socket.handshake)

      const { token, project_uid } = socket.handshake.auth.token
      const { success, data } = await authMidleware.use(token)
      if (success) {
        IoSocketsRepository.socketClients.push({ id: socket.id, projectUid: project_uid, user: data, socket })
        next()
      }

      return next(new Error('Error en la autenticacion'))
    })

    this.httpsServer.listen(process.env.WEBSOCKET_PORT)
  }

  //   bindMessageHandlers(socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>, handlers: MessageMappingProperties[], transform: (data: any) => Observable<any>): void {
  //     this.bindMessageHandlers(socket, handlers, transform)

  //   }
  //   bindClientConnect(server: any, callback: Function): void {
  //     console.log(server)
  //   }

  //   bindMessageHandlers(socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>, handlers: MessageMappingProperties[], transform: (data: any) => Observable<any>): void {
  //     console.log('hsoooooocket', socket.nsp.name)
  //     handlers.forEach(h => {
  //       socket.on(h.message, h.callback)
  //     })
  //     console.log('handlesadkjajklsdjladskjakj65656565', handlers)
  //     // console.log('TRANSFORMMMMMMMMMMMMMMMMMMMMMMMMMMMMM', JSON.stringify(transform))
  //   }
  //   bindMessageHandlers(socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>, handlers: MessageMappingProperties[], transform: (data: any) => Observable<any>): void {
  //     console.log('[ MESSAGES HANDLERS ]', handlers)
  //   }

  create(port: number, options?: any) {
    return this.ioServer
  }
}
