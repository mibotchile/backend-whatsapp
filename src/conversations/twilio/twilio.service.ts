import { Injectable, Scope, Inject, forwardRef } from '@nestjs/common'
// import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
// import { DataSource, Repository } from 'typeorm'
// import { PointerConversation } from './pointer-conversation.entity'
// import { ChannelConfig } from 'src/channel/channel_config.entity'
import * as twilio from 'twilio'
// import { Config, Message, Menu, Option, Question, Quiz, Redirect } from '../conversation.types'
import { MessageGateway } from '../messages-gateway/message.gateway'

@Injectable({ scope: Scope.REQUEST })
export class TwilioService {
  constructor(
    @Inject(forwardRef(() => MessageGateway)) private readonly messageWs: MessageGateway
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

  async sendMessage(message: string, from: string, to: string, emitEvent = false) {
    const twilioClient = twilio(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN)

    await twilioClient.messages.create({
      from: 'whatsapp:+14155238886',
      // from: `whatsapp:${from}`,
      body: message,
      to: `whatsapp:+${to}`
    })
    if (emitEvent) {
      this.messageWs.sendMessageReceived({ Body: message })
    }
  }
}
