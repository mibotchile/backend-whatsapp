import { Module } from '@nestjs/common'
import { GroupService } from './groups.service'
import { GroupController } from './group.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Group } from './group.entity'
import { ChannelConfig } from 'src/channel/channel-config/channel_config.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Group, ChannelConfig])],
  controllers: [GroupController],
  providers: [GroupService]
})
export class GroupModule {}
