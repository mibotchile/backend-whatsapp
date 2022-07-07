import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Channel } from './channel.entity'
import { ChannelController } from './channel.controller'
import { ChannelService } from './channel.service'
import { ChannelConfig } from './channel-config/channel_config.entity'
import { ChannelMapService } from './channel-map/channel-map.service'
import { ChannelMap } from './channel-map/channel-map.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Channel, ChannelConfig, ChannelMap])],
  controllers: [ChannelController],
  providers: [ChannelService, ChannelMapService]
})
export class ChannelModule {}
