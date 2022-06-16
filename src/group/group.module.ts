import { Module } from '@nestjs/common'
import { GroupService } from './groups.service'
import { GroupController } from './group.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Group } from './group.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Group])],
  controllers: [GroupController],
  providers: [GroupService]
})
export class GroupModule {}
