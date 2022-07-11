import { IoAdapter } from '@nestjs/platform-socket.io'
import { Server } from 'socket.io'
import * as https from 'node:https'
import * as http from 'node:http'
import * as fs from 'node:fs'

export class ExtendedSocketIoAdapter extends IoAdapter {
  protected ioServer: Server
  protected httpsServer:https.Server|http.Server

  constructor() {
    super()
    console.log('SE LLAMO AL CONTRUCTOR DEL ADAPTER')
    const options = {
      cors: {
        origin: true,
        methods: ['GET', 'POST'],
        credentials: true
      },
      allowEIO3: true
    }
    let httpsOptions
    if ((process.env.SSL && process.env.SSL === 'true') || process.env.NODE_ENV === 'production') {
      console.log('SSL ENABLED')
      httpsOptions = {
        key: fs.readFileSync(process.env.SSL_KEY),
        cert: fs.readFileSync(process.env.SSL_CERT)
      }
      this.httpsServer = https.createServer(httpsOptions)
    } else {
      this.httpsServer = http.createServer(httpsOptions)
    }

    // if ((process.env.SSL && process.env.SSL === 'true') || process.env.NODE_ENV === 'production') {
    // console.log(httpsServer)

    //   }

    this.ioServer = new Server(this.httpsServer, options)

    // this.ioServer.use((socket, next) => {
    //   console.log('[ ====== MIDLEWARE ====== ]', socket.handshake)

    //   const token = socket.handshake.auth.token
    //   if (token === 'abcd') {
    //     console.log('[CONECTAD0]')
    //     return next()
    //   }
    //   console.log('[NO SE CONECT0]')

    //   return next(new Error('Error en la autenticacion'))
    // })

    this.httpsServer.listen(process.env.WEBSOCKET_PORT)
  }

  //   createIOServer(port: number, options?: any) {
  //     console.log('CREANDO SERVIDOr EN ASDASDD ----*--**-*--**--*-* io server', options, port)

  //     // this.ioServer.of(options.namespace)
  //     // return this.ioServer
  //   }

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
    console.log('[ WEBSOCKET ]', options.namespace, port)

    // this.ioServer.of(options.namespace)
    // ds.server
    return this.ioServer
  }

//   create (port: number, options:any) {
//     options.cors = {
//       origin: true,
//       methods: ['GET', 'POST'],
//       credentials: true
//     }
//     io()
//     console.log('websocket gateway port argument is ignored by ExtendedSocketIoAdapter, use the same port of http instead')
//     this.ioServer = new Server(this.httpsServer, options)
//     return this.ioServer
//   }
}
