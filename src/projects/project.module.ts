import { Module } from '@nestjs/common'
import { ProjectService } from './project.service'
import { ProjectController } from './project.controller'
import { PrismaModule } from 'src/prisma/prisma.module'
// import { PrismaService } from 'src/prisma/prisma.service'

@Module({
  imports: [PrismaModule],
  controllers: [ProjectController],
  providers: [ProjectService]
})
export class ProjectModule {}
