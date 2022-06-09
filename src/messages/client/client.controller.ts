import { Controller, Inject, forwardRef } from '@nestjs/common'
import { EventPattern } from '@nestjs/microservices'
import { MessageGateway } from '../message.gateway'

@Controller('client')
export class ClientController {
  constructor(
    @Inject(forwardRef(() => MessageGateway))
    private readonly messageWs: MessageGateway
  ) {}

  @EventPattern('whatsapp_message_received')
  async handleMessagePrinted(data: Record<string, unknown>) {
    this.messageWs.sendMessageReceived(data)
    console.log(data)
  }
}
