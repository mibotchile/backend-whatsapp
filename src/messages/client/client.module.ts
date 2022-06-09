import { Module } from '@nestjs/common'
import { MessageGateway } from '../message.gateway'
import { ClientController } from './client.controller'

@Module({
  controllers: [ClientController],
  providers: [MessageGateway]
})
export class ClientModule {}
