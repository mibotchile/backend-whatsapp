import { Module } from '@nestjs/common'
import { MessageService } from './message.service'
import { MessageController } from './message.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { MessageGateway } from '../messages-gateway/message.gateway'
import { TwilioService } from '../twilio/twilio.service'
import { Message } from './message.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Message])],
  controllers: [MessageController],
  providers: [MessageService, MessageGateway, TwilioService]
})
export class MessageModule {}
