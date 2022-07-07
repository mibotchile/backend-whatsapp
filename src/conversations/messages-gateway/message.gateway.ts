import { SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayConnection } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { TwilioService } from '../twilio/twilio.service'
import { forwardRef, Inject } from '@nestjs/common'

@WebSocketGateway(Number(process.env.WEBSOCKET_PORT),
  {
    cors: { origin: ['http://localhost:8081'], credentials: true },
    allowEIO3: true,
    namespace: 'messages'
  })
export class MessageGateway implements OnGatewayConnection {
  @WebSocketServer()
    server:Server

  rooms:any[] = []
  constructor(
    @Inject(forwardRef(() => TwilioService))
      private twilioService:TwilioService
  ) {
    // console.log('[WEBSOCKET MESSAGES ] =======>  ', this.server)
  }

  handleConnection(client) {
    console.log('[ ==== SE CONECTO UN CLIENTE ====]')
  }

    @SubscribeMessage('send_message')
  async sendMessage(client: Socket, { conversationId, clientNumber, channelNumber, message }:any): Promise<any> {
    console.log('Enviando mensaje .......')
    await this.twilioService.sendMessage(message, channelNumber, clientNumber, conversationId, true)
    console.log('Mensaje enviado .......')
  }

    emitNewMessage(data) {
    //   this.server.of('/messages').emit('whatsapp_message_received', data)
      this.server.emit('whatsapp_message_received', data)
    }

    //   emitCountMessage(data) {
    //     this.server.emit('whatsapp_message_received', data)
    //   }

    changeMessageStatus(data) {
    //   this.server.of('/messages').emit('whatsapp_message_status', data)
      this.server.emit('whatsapp_message_status', data)
    }
}
