import { Module } from '@nestjs/common'
import { UserService } from './user.service'
import { UserController } from './user.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from './user.entity'
import { Group } from 'src/group/group.entity'
import { Role } from 'src/role/role.entity'

@Module({
  imports: [TypeOrmModule.forFeature([User, Group, Role])],
  controllers: [UserController],
  providers: [UserService]
})
export class UserModule {}
