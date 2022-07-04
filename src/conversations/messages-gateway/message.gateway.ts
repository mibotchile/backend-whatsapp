import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets'

@WebSocketGateway(Number(process.env.WEBSOCKET_PORT),
  {
    cors: { origin: true, credentials: true },
    allowEIO3: true
  })
export class MessageGateway {
  @WebSocketServer()
    server

  constructor() {
    console.log('ws posrtssss', process.env.WEBSOCKET_PORT)
  }

  @SubscribeMessage('events')
  handleMessage(client: any, payload: any): string {
    console.log({ client })
    console.log({ payload })

    return 'Hello world!'
  }

  @SubscribeMessage('connected')
  handleConnect(client:any) {
    console.log(client.id)
  }

  sendMessageReceived(data) {
    this.server.emit('whatsapp_message_received', data)
  }
}
