import { Controller, Inject, forwardRef } from '@nestjs/common'
import { EventPattern } from '@nestjs/microservices'
import { ConversationManagerService } from '../conversation-manager/conversation-manager.service'
import { MessageGateway } from '../messages-gateway/message.gateway'

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
    @Inject(forwardRef(() => MessageGateway))
    private readonly messageWs: MessageGateway, private conversatioManagerService:ConversationManagerService
  ) {}

  @EventPattern('whatsapp_message_received')
  async handleMessagePrinted(data: Record<string, any>) {
    this.messageWs.sendMessageReceived(data)
    this.conversatioManagerService.messageClietHandler(data.Body, data.WaId, data.To.replace('whatsapp:', ''))
    console.log(data)
  }

  @EventPattern('test_rabbit')
  async handleTestMessagePrinted(data: Record<string, unknown>) {
    // this.messageWs.sendMessageReceived(data)
    console.log('[TEST RABBIT]', data)
  }
}
