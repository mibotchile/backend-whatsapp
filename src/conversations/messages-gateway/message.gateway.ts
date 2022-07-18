import { SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayConnection } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { TwilioService } from '../twilio/twilio.service'
import { forwardRef, Inject } from '@nestjs/common'
import { IoSocketsRepository } from 'src/io-adapter/io-sockets-repository'
import { Message } from '../messages/message.entity'

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
    await this.twilioService.sendMessage(message, channelNumber, clientNumber, conversationId, projectUid)
    console.log('Mensaje enviado .......')
  }

    // @SubscribeMessage('test')
    // test(client: Socket, data:any):any {
    //   console.log('TESTEANDO SOCKeT .......')
    //   this.emitTest(data)
    //   console.log('SOCKET TESTTEADO .......')
    // }

    emitNewMessage(projectUid:string, conversationManager:string, data:Message) {
    //   this.server.of('/messages').emit('whatsapp_message_received', data)
      const [manager, managerId] = conversationManager.split('_')
      let socketsClientIds:string[]
      if (manager === 'group') {
        const socketsClient = IoSocketsRepository.findByGroupId(projectUid, Number(managerId))
        socketsClientIds = socketsClient.map(sci => sci.id)
      }
      if (manager === 'user') {
        const socketsClient = IoSocketsRepository.findByUserId(projectUid, Number(managerId))
        socketsClientIds = [socketsClient.id]
      }
      this.server.to(socketsClientIds).emit('whatsapp_message_received', data)
    }

    //   emitCountMessage(data) {
    //     this.server.emit('whatsapp_message_received', data)
    //   }
    // emitTest(data) {
    //   const client = IoSocketsRepository.findByUserEmail('fernando@onbotgo.com')
    //   this.server.to(client.id).emit('test', data)
    // }

    changeMessageStatus(data) {
    //   this.server.of('/messages').emit('whatsapp_message_status', data)
      this.server.emit('whatsapp_message_status', data)
    }
}
