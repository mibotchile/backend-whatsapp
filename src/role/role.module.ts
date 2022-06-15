import { Module } from '@nestjs/common'
import { RoleService } from './role.service'
import { RoleController } from './role.controller'
import { PrismaModule } from 'src/prisma/prisma.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Role } from './role.entity'

@Module({
  imports: [PrismaModule, TypeOrmModule.forFeature([Role])],
  controllers: [RoleController],
  providers: [RoleService]
})
export class RoleModule {}
