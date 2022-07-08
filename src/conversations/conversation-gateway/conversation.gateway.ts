import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { forwardRef, Inject } from '@nestjs/common'
import { Server, Socket } from 'socket.io'
import { ConversationService } from '../conversation/conversation.service'
import { ClientProxy } from '@nestjs/microservices'

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
  async redirectConversation(client: Socket, { conversationId, manager, managerId }:any): Promise<any> {
    console.log('Redireccionando conversacion ... .. .')
    console.log({ conversationId })
    console.log({ manager })
    console.log({ managerId })
    await this.conversationService.updateManager(+conversationId, manager, managerId)
    const conversation = await this.conversationService.findById(conversationId)
    console.log('Conversacion redireccionada ')

    this.emitNewConversation(conversation)
    return conversation
  }

  @SubscribeMessage('end_conversation')
  async endConversation(client: Socket, { conversationId }:any): Promise<any> {
    console.log({ conversationId })

    await this.conversationService.updateManager(+conversationId, 'system', 0)
    const conversation = await this.conversationService.findById(conversationId)
    this.client.emit<any>('continue_conversation', conversation)
    return conversation
    // return this.conversationGateway.emitNewConversation(conversation)
  }

  emitNewConversation(data) {
    this.server.emit('new_conversation', data)
  }
}
