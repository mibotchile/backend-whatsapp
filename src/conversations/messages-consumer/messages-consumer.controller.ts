import { Controller, Inject, forwardRef } from '@nestjs/common'
import { EventPattern } from '@nestjs/microservices'
import { ChannelMapService } from 'src/channel/channel-map/channel-map.service'
import { ConversationManagerService } from '../conversation-manager/conversation-manager.service'
import { MessageGateway } from '../messages-gateway/message.gateway'
import { MessageService } from '../messages/message.service'

@Controller('messagesConsumer')
export class MessagesConsumerController {
  constructor(
    @Inject(forwardRef(() => MessageGateway)) private readonly messageWs: MessageGateway,
    private conversatioManagerService:ConversationManagerService,
    private messageService:MessageService,
    private channelMapService:ChannelMapService
  ) {
  }

  @EventPattern('whatsapp_message_received')
  async handleMessagePrinted(data: Record<string, any>) {
    const channelNumber = data.To.replace('whatsapp:', '')
    const channelMap = await this.channelMapService.findByNumber(channelNumber)
    if (!channelMap) return
    const schema = 'project_' + channelMap.project_uid.toLowerCase()
    await this.conversatioManagerService.messageClientHandler(data, data.WaId, schema, channelNumber)
    console.log(data)
  }

  @EventPattern('continue_conversation')
  async handleConversation(data: Record<string, any>) {
    const { conversation, project_uid } = data
    const schema = 'project_' + project_uid.toLowerCase()
    await this.conversatioManagerService.messageClientHandler({ Body: '' }, conversation.client_number, schema, conversation.channel_number, false)
    console.log(data)
  }

  @EventPattern('whatsapp_message_status')
  async handleMessageStatus(data: Record<string, any>) {
    this.messageWs.changeMessageStatus({ sid: data.MessageSid, message_status: data.MessageStatus })
    this.messageService.updateStatusBySid(data.MessageSid, data.MessageStatus)
    console.log(data)
  }

  @EventPattern('test_rabbit')
  async handleTestMessagePrinted(data: Record<string, unknown>) {
    // this.messageWs.sendMessageReceived(data)
    console.log('[TEST RABBIT]', data)
  }
}
