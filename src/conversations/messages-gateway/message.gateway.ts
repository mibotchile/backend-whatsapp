import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { TwilioService } from '../twilio/twilio.service'

@WebSocketGateway(Number(process.env.WEBSOCKET_PORT),
  {
    cors: { origin: ['http://localhost:8081'], credentials: true },
    allowEIO3: true,
    namespace: 'messages'
  })
export class MessageGateway {
  @WebSocketServer()
    server:Server

  rooms:any[] = []
  constructor(
      private twilioService:TwilioService
  ) {
    console.log('[WEBSOCKET MESSAGES PORT] =======>  ', process.env.WEBSOCKET_PORT)
  }

    @SubscribeMessage('send_message')
  async sendMessage(client: Socket, { conversationId, clientNumber, channelNumber, message }:any): Promise<any> {
    console.log(conversationId)

    // const clientNumber = clientNumber // 51938432015
    // const channelNumber = channelNumber// +519655655656
    // const message = message // mensaje a enviar

    await this.twilioService.sendMessage(message, channelNumber, clientNumber, conversationId, true)
  }
    //   @SubscribeMessage('connected')
    //     handleConnect(client:Socket, { conversationId }) {
    //       this.rooms[client.id] = { conversationId }
    //     }

    sendMessageReceived(data) {
      this.server.emit('whatsapp_message_received', data)
    }

    emitNewMessage(data) {
      this.server.emit('whatsapp_message_received', data)
    }

    emitNewConversation(data) {
      this.server.emit('new_conversation', data)
    }

    //   emitCountMessage(data) {
    //     this.server.emit('whatsapp_message_received', data)
    //   }

    changeMessageStatus(data) {
      this.server.emit('whatsapp_message_status', data)
    }
}
