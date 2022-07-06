import { Controller, Inject, forwardRef } from '@nestjs/common'
import { EventPattern } from '@nestjs/microservices'
import { ConversationManagerService } from '../conversation-manager/conversation-manager.service'
import { MessageGateway } from '../messages-gateway/message.gateway'
import { MessageService } from '../messages/message.service'

// interface MessageInfo{
//     'MediaContentType0': string,
//         'ProfileName': string,
//         'WaId': string,
//         'SmsStatus': string,
//         'Body': string,
//         'To': string,
//         'MessageSid': string,
//         'AccountSid': string
//         'From':string,
// }

@Controller('messagesConsumer')
export class MessagesConsumerController {
  constructor(
    @Inject(forwardRef(() => MessageGateway)) private readonly messageWs: MessageGateway,
    private conversatioManagerService:ConversationManagerService,
    private messageService:MessageService
  ) {}

  @EventPattern('whatsapp_message_received')
  async handleMessagePrinted(data: Record<string, any>) {
    await this.conversatioManagerService.messageClientHandler(data, data.WaId, data.To.replace('whatsapp:', ''))
    console.log(data)
  }

  @EventPattern('continue_conversation')
  async handleConversation(data: Record<string, any>) {
    await this.conversatioManagerService.messageClientHandler({ Body: '' }, data.client_number, data.channel_number, false)
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
