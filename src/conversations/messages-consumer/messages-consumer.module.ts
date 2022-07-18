import { Module } from '@nestjs/common'
import { MessageGateway } from '../messages-gateway/message.gateway'
import { MessagesConsumerController } from './messages-consumer.controller'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { resolve } from 'node:path'
import { PointerConversation } from '../conversation-manager/pointer-conversation.entity'
import { Channel } from 'src/channel/channel.entity'
import { ChannelConfig } from 'src/channel/channel-config/channel_config.entity'
import { ConversationManagerService } from '../conversation-manager/conversation-manager.service'
import { TwilioService } from '../twilio/twilio.service'
import { ConversationService } from '../conversation/conversation.service'
import { Conversation } from '../conversation/conversation.entity'
import { MessageService } from '../messages/message.service'
import { Message } from '../messages/message.entity'
import { PointerConversationService } from '../conversation-manager/pointer-conversation.service'
import { ChannelConfigService } from 'src/channel/channel-config/channel-config.service'
import { ConversationGateway } from '../conversation-gateway/conversation.gateway'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq'
import { ChannelMapService } from 'src/channel/channel-map/channel-map.service'
import { ChannelMap } from 'src/channel/channel-map/channel-map.entity'
import { ChannelService } from 'src/channel/channel.service'
import { GroupService } from 'src/group/groups.service'
import { UserService } from 'src/user/user.service'
import { Group } from 'src/group/group.entity'
import { User } from 'src/user/user.entity'
import { Role } from 'src/role/role.entity'

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: resolve(process.cwd(), `.env.${process.env.NODE_ENV}`)
    }),
    RabbitMQModule.forRoot(RabbitMQModule, {
      exchanges: [
        {
          name: process.env.RABBIT_BI_EXCHANGE,
          type: 'direct'
        }
      ],
      uri: process.env.RABBIT_URL,
      connectionInitOptions: { wait: false }
    }),
    ClientsModule.register([
      {
        name: 'SAMPLE_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBIT_URL],
          queue: process.env.RABBIT_WHATSAPP_MESSAGES_QUEUE,
          queueOptions: {
            durable: true
          }
        }
      }
    ]),
    TypeOrmModule.forRoot({
      type: 'postgres',
      useUTC: false,
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      entities: [PointerConversation, Channel, ChannelConfig, Conversation, Message, ChannelMap, Group, User, Role],
      logging: process.env.TYPEORM_LOGS === 'true'
    }),
    TypeOrmModule.forFeature([PointerConversation, Channel, ChannelConfig, Conversation, Message, ChannelMap, Group, User, Role])
  ],
  controllers: [MessagesConsumerController],
  providers: [
    MessageService,
    TwilioService,
    MessageGateway,
    ConversationGateway,
    ConversationManagerService,
    ConversationService,
    PointerConversationService,
    ChannelConfigService,
    ChannelMapService,
    ChannelService,
    GroupService,
    UserService
  ]
})
export class MessagesConsumerModule {}
