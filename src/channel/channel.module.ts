import { Module } from '@nestjs/common'
import { ChannelService } from './channel.service'
import { ChannelController } from './channel.controller'
import { PrismaClient } from '@prisma/client'

@Module({
  controllers: [ChannelController],
  providers: [ChannelService, PrismaClient]
})
export class ChannelModule {}
