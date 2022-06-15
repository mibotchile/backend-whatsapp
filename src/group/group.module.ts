import { Module } from '@nestjs/common'
import { GroupService } from './groups.service'
import { GroupController } from './group.controller'
import { PrismaModule } from 'src/prisma/prisma.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Group } from './group.entity'
// import { PrismaService } from 'src/prisma/prisma.service'

@Module({
  imports: [PrismaModule, TypeOrmModule.forFeature([Group])],
  controllers: [GroupController],
  providers: [GroupService]
})
export class GroupModule {}
