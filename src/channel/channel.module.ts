import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Channel } from './channel.entity'
import { ChannelController } from './channel.controller'
import { ChannelService } from './channel.service'
import { ChannelConfig } from './channel-config/channel_config.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Channel, ChannelConfig])],
  controllers: [ChannelController],
  providers: [ChannelService]
})
export class ChannelModule {}
