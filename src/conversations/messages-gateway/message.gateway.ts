import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets'

@WebSocketGateway(3003,
  {
    cors: { origin: '*' }
  })
export class MessageGateway {
  @WebSocketServer()
    server

  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    return 'Hello world!'
  }

  sendMessageReceived(data) {
    this.server.emit('whatsapp_message_received', data)
  }
}
