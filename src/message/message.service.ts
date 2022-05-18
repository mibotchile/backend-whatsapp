import { Injectable } from '@nestjs/common'
import twilio from 'twilio'

@Injectable()
export class MessageService {
  async send (sender, receiver, message): Promise<any> {
    try {
      const twilioClient = twilio(
        process.env.ACCOUNT_SID,
        process.env.AUTH_TOKEN
      )
      return await twilioClient.messages.create({
        from: `whatsapp:+${sender}`,
        body: message,
        to: `whatsapp:+${receiver}`
      })
    } catch (e) {
      return e
    }
  }
}
