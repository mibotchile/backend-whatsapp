import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { resolve } from 'node:path'
import { Group } from 'src/group/group.entity'
import { ProjectService } from 'src/projects/project.service'
import { Role } from 'src/role/role.entity'
import { OrphanUser } from 'src/user/orphan-user.entity'
import { OrphanUserService } from 'src/user/orphan-user.service'
import { User } from 'src/user/user.entity'
import { UserService } from 'src/user/user.service'
import { AIMConsumerController } from './aim-consumer.controller'

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: resolve(process.cwd(), `.env.${process.env.NODE_ENV}`)
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      entities: [OrphanUser, User, Group, Role],
      logging: process.env.TYPEORM_LOGS === 'true'
    }),
    TypeOrmModule.forFeature([OrphanUser, User, Group, Role])
  ],
  controllers: [AIMConsumerController],
  providers: [OrphanUserService, ProjectService, UserService]
})
export class AIMConsumerModule {}
