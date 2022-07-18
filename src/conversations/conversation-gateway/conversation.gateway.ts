import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { forwardRef, Inject } from '@nestjs/common'
import { Server, Socket } from 'socket.io'
import { ConversationService } from '../conversation/conversation.service'
import { ClientProxy } from '@nestjs/microservices'
import { Conversation } from '../conversation/conversation.entity'
import { IoSocketsRepository } from 'src/io-adapter/io-sockets-repository'

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
    @Inject(forwardRef(() => ConversationService))
    private conversationService:ConversationService,
    @Inject('SAMPLE_SERVICE') private readonly client: ClientProxy
  ) {
    // console.log('[WEBSOCKET CONVERSATIONS PORT] =======>  ', process.env.WEBSOCKET_PORT)
  }

  rooms:any[] = []

  handleConnection(socket:Socket) {
    console.log('[ ==== SE CONECTO UN CLIENTE A CONVERSATIONS ====]')
    console.log('[ ====== ID DEL CLIENTE ====== ]', socket.id)
  }

  async onApplicationBootstrap() {
    try {
      await this.client.connect()
      console.log('[RABBITMQ CONECTADO] - [url] ' + process.env.RABBIT_URL)
    } catch (error) {
      console.log('error', error)
    }
  }

  @SubscribeMessage('redirect_conversation')
  async redirectConversation(client: Socket, { conversationId, manager, managerId, projectUid }:any): Promise<any> {
    console.log('Redireccionando conversacion ...')
    console.log({ conversationId })
    console.log({ manager })
    console.log({ managerId })
    await this.conversationService.updateManager(projectUid, +conversationId, manager, managerId)
    const conversation = await this.conversationService.findById(projectUid, conversationId) // FIXME devolver el ultimo mensaje
    console.log('Conversacion redireccionada ')

    this.emitNewConversation(projectUid, conversation)
    return conversation
  }

  @SubscribeMessage('end_conversation')
  async endConversation(client: Socket, { conversationId, projectUid }:any): Promise<any> {
    console.log({ conversationId })
    await this.conversationService.updateManager(projectUid, +conversationId, 'system', 0)
    const conversation = await this.conversationService.findById(projectUid, conversationId) // FIXME devolver el ultimo mensaje
    this.client.emit<any>('continue_conversation', { conversation, project_uid: projectUid })
    return conversation
  }

  emitNewConversation(projectUid:string, data:Conversation) {
    const [manager, managerId] = data.manager.split('_')
    let socketsClientIds:string[]
    if (manager === 'group') {
      const socketsClient = IoSocketsRepository.findByGroupId(projectUid, Number(managerId))
      socketsClientIds = socketsClient.map(sci => sci.id)
    }
    if (manager === 'user') {
      const socketsClient = IoSocketsRepository.findByUserId(projectUid, Number(managerId))
      socketsClientIds = [socketsClient.id]
    }
    this.server.to(socketsClientIds).emit('new_conversation', data)
  }
}
