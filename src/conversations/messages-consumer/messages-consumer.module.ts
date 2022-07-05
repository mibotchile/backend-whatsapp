import { Module } from '@nestjs/common'
import { MessageGateway } from '../messages-gateway/message.gateway'
import { MessagesConsumerController } from './messages-consumer.controller'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { resolve } from 'node:path'
import { PointerConversation } from '../conversation-manager/pointer-conversation.entity'
import { Channel } from 'src/channel/channel.entity'
import { ChannelConfig } from 'src/channel/channel_config.entity'
import { ConversationManagerService } from '../conversation-manager/conversation-manager.service'
import { TwilioService } from '../twilio/twilio.service'

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: resolve(process.cwd(), `.env.${process.env.NODE_ENV}`)
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      entities: [PointerConversation, Channel, ChannelConfig],
      logging: process.env.TYPEORM_LOGS === 'true'
    }),
    TypeOrmModule.forFeature([PointerConversation, Channel, ChannelConfig])
  ],
  controllers: [MessagesConsumerController],
  providers: [MessageGateway, ConversationManagerService, TwilioService]
})
export class MessagesConsumerModule {}
