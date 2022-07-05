import { Module } from '@nestjs/common'
import { MessageApiService } from './message-api.service'
import { MessageController } from './message.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Message } from './message.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Message])],
  controllers: [MessageController],
  providers: [MessageApiService]
})
export class MessageApiModule {}
