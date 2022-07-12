import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Channel } from './channel.entity'
import { ChannelController } from './channel.controller'
import { ChannelService } from './channel.service'
import { ChannelConfig } from './channel-config/channel_config.entity'
import { ChannelMapService } from './channel-map/channel-map.service'
import { ChannelMap } from './channel-map/channel-map.entity'
import { GroupService } from 'src/group/groups.service'
import { UserService } from 'src/user/user.service'
import { User } from 'src/user/user.entity'
import { Group } from 'src/group/group.entity'
import { Role } from 'src/role/role.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Channel, ChannelConfig, ChannelMap, User, Group, Role])],
  controllers: [ChannelController],
  providers: [ChannelService, ChannelMapService, GroupService, UserService]
})
export class ChannelModule {}
