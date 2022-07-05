import { Module } from '@nestjs/common'
import { ConversationService } from './conversation.service'
import { ConversationController } from './conversation.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Conversation } from './conversation.entity'
import { MessageGateway } from '../messages-gateway/message.gateway'
import { TwilioService } from '../twilio/twilio.service'

@Module({
  imports: [TypeOrmModule.forFeature([Conversation])],
  controllers: [ConversationController],
  providers: [ConversationService, MessageGateway, TwilioService]
})
export class ConversationModule {}
