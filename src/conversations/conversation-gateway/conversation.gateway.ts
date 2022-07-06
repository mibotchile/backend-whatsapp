import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { ConversationService } from '../conversation/conversation.service'

@WebSocketGateway(Number(process.env.WEBSOCKET_PORT),
  {
    cors: { origin: ['http://localhost:8081'], credentials: true },
    allowEIO3: true,
    namespace: 'conversations'
  })

export class ConversationGateway {
  @WebSocketServer()
    server:Server

  constructor(
    private conversationService:ConversationService
  ) {
    console.log('[WEBSOCKET CONVERSATIONS PORT] =======>  ', process.env.WEBSOCKET_PORT)
  }

  rooms:any[] = []

  @SubscribeMessage('redirect_conversation')
  async redirectConversation(client: Socket, { conversationId, manager, managerId }:any): Promise<any> {
    console.log({ conversationId })
    console.log({ manager })
    console.log({ managerId })

    await this.conversationService.updateManager(+conversationId, manager, managerId)
    const conversation = await this.conversationService.findById(conversationId)
    this.emitNewConversation(conversation)
    return conversation
  }

  @SubscribeMessage('end_conversation')
  async endConversation(client: Socket, { conversationId }:any): Promise<any> {
    console.log({ conversationId })

    await this.conversationService.updateManager(+conversationId, 'system', 0)
    const conversation = await this.conversationService.findById(conversationId)
    return conversation
    // return this.conversationGateway.emitNewConversation(conversation)
  }

  emitNewConversation(data) {
    this.server.emit('new_conversation', data)
  }
}
