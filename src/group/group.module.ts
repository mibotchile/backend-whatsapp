import { Module } from '@nestjs/common'
import { GroupService } from './groups.service'
import { GroupController } from './group.controller'
import { PrismaModule } from 'src/prisma/prisma.module'
// import { PrismaService } from 'src/prisma/prisma.service'

@Module({
  imports: [PrismaModule],
  controllers: [GroupController],
  providers: [GroupService]
})
export class GroupModule {}
