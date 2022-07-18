import { SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayConnection } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { TwilioService } from '../twilio/twilio.service'
import { forwardRef, Inject } from '@nestjs/common'
import { IoSocketsRepository } from 'src/io-adapter/io-sockets-repository'

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

  handleConnection(socket:Socket, query) {
    console.log('[ ==== SE CONECTO UN CLIENTE A MESSAGES ====]')
    console.log('[ ====== ID DEL CLIENTE ====== ]', socket.id)
    console.log('[ ====== DATA DEL CLIENTE ====== ]', socket.handshake)
  }

    @SubscribeMessage('send_message')
  async sendMessage(client: Socket, { conversationId, clientNumber, channelNumber, message, projectUid }:any): Promise<any> {
    console.log('Enviando mensaje .......')
    await this.twilioService.sendMessage(message, channelNumber, clientNumber, conversationId, 'project_' + projectUid.toLowerCase())
    console.log('Mensaje enviado .......')
  }

    @SubscribeMessage('test')
    test(client: Socket, data:any):any {
      console.log('TESTEANDO SOCKeT .......')
      this.emitTest(data)
      console.log('SOCKET TESTTEADO .......')
    }

    emitNewMessage(data) {
    //   this.server.of('/messages').emit('whatsapp_message_received', data)
      this.server.emit('whatsapp_message_received', data)
    }

    //   emitCountMessage(data) {
    //     this.server.emit('whatsapp_message_received', data)
    //   }
    emitTest(data) {
      const client = IoSocketsRepository.findByUserEmail('fernando@onbotgo.com')
      this.server.to(client.id).emit('test', data)
    }

    changeMessageStatus(data) {
    //   this.server.of('/messages').emit('whatsapp_message_status', data)
      this.server.emit('whatsapp_message_status', data)
    }
}
