import { Injectable } from '@nestjs/common'
import * as twilio from 'twilio'
import { MessageService } from '../messages/message.service'

@Injectable()
export class TwilioService {
  constructor(
    private messageService:MessageService
  ) { }

  async sendMessage(message: string, from: string, to: string, conversationId:number, emitEvent = false) {
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
      const now = new Intl.DateTimeFormat('af-ZA', { year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: 'numeric', second: 'numeric', timeZone: 'UTC' }).format(Date.now())
      this.messageService.save(
        {
          sid: messageInfo.sid,
          conversation_id: conversationId,
          content_type: 'text',
          message,
          media_url: '',
          from_client: false,
          message_status: 'sent',
          created_at: now,
          created_by: 'system',
          status: 1
        }
      )
      return messageInfo
    } catch (e) {
      console.log(e)
      return false
    }
  }
}
