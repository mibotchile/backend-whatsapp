import { IoAdapter } from '@nestjs/platform-socket.io'
import { Server } from 'socket.io'
import * as https from 'node:http'
import * as fs from 'node:fs'

export class ExtendedSocketIoAdapter extends IoAdapter {
  protected ioServer: Server
  protected httpsServer:https.Server

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
    }

    // if ((process.env.SSL && process.env.SSL === 'true') || process.env.NODE_ENV === 'production') {
    this.httpsServer = https.createServer(httpsOptions)
    // console.log(httpsServer)

    //   }

    this.ioServer = new Server(this.httpsServer, options)
    this.httpsServer.listen(process.env.WEBSOCKET_PORT)
  }

  //   createIOServer(port: number, options?: any) {
  //     console.log('CREANDO SERVIDOr EN ASDASDD ----*--**-*--**--*-* io server', options, port)

  //     // this.ioServer.of(options.namespace)
  //     // return this.ioServer
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
