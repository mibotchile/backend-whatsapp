import { Injectable } from '@nestjs/common'
import * as twilio from 'twilio'
import { ConversationService } from '../conversation/conversation.service'
import { MessageService } from '../messages/message.service'

@Injectable()
export class TwilioService {
  constructor(
    private messageService:MessageService,
    private conversationService:ConversationService
  ) { }

  async sendMessage(message: string, from: string, to: string, conversationId:number, projectUid:string) { // TODO pedir que se mande toda la data de conversation
    const conversation = await this.conversationService.findById(projectUid, conversationId) // FIXME es nesesario devolver el ultimo mensaje??
    if (conversation.manager.includes('group')) return false
    const twilioClient = twilio(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN)
    try {
      const messageData = {
        from: 'whatsapp:+14155238886',
        // from: `whatsapp:${from}`,
        body: message,
        to: `whatsapp:+${to}`
      } as any
      if (process.env.TWILIO_URL_STATUS) {
        messageData.statusCallback = `${process.env.TWILIO_URL_STATUS}/messageStatus`
      }

      const messageInfo = await twilioClient.messages.create(messageData)
      await this.messageService.save(projectUid,
        {
          sid: messageInfo.sid,
          conversation_id: conversationId,
          content_type: 'text',
          message,
          media_url: '',
          from_client: false,
          message_status: 'sent',
          created_at: 'now',
          created_by: 'system',
          status: 1
        }, conversation.manager, !conversation.manager.includes('system')
      )
      return messageInfo
    } catch (e) {
      console.log(e)
      return false
    }
  }
}
