import { Injectable, Inject, forwardRef } from '@nestjs/common'
// import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
// import { DataSource, Repository } from 'typeorm'
// import { PointerConversation } from './pointer-conversation.entity'
// import { ChannelConfig } from 'src/channel/channel_config.entity'
import * as twilio from 'twilio'
// import { Config, Message, Menu, Option, Question, Quiz, Redirect } from '../conversation.types'
import { MessageGateway } from '../messages-gateway/message.gateway'
import { MessageService } from '../messages/message.service'

@Injectable()
export class TwilioService {
  constructor(
    @Inject(forwardRef(() => MessageGateway)) private readonly messageWs: MessageGateway,
    private messageService:MessageService
    // @InjectDataSource('default') private dataSource: DataSource,
    // @InjectRepository(PointerConversation) private pointerRepo: Repository<PointerConversation>,
    // @InjectRepository(ChannelConfig) private channelConfigRepo: Repository<ChannelConfig>
  ) {
    // this.setSchema('project_vnblnzdm0b3bdcltpvpl')
  }

  //   setSchema(schema:string) {
  //     this.dataSource.entityMetadatas.forEach((em, index) => {
  //       this.dataSource.entityMetadatas[index].schema = schema // httpContext.get('PROJECT_UID').toLowerCase()
  //       this.dataSource.entityMetadatas[index].tablePath = `${schema}.${em.tableName}`
  //     })
  //   }

  async sendMessage(message: string, from: string, to: string, conversationId:number, emitEvent = false) {
    const twilioClient = twilio(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN)
    try {
      const messageInfo = await twilioClient.messages.create({
        from: 'whatsapp:+14155238886',
        // from: `whatsapp:${from}`,
        body: message,
        to: `whatsapp:+${to}`,
        statusCallback: 'https://c1fd-181-66-195-199.ngrok.io/messageStatus'

      })
      const now = new Intl.DateTimeFormat('af-ZA', { year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: 'numeric', second: 'numeric' }).format(Date.now())

      //   if (emitEvent) {
      //     this.messageWs.sendMessageReceived(messageInfo)
      //   }
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
    }
  }
}
