import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { GroupModule } from './group/group.module'
import { resolve } from 'node:path'
import { RoleModule } from './role/role.module'
import { UserModule } from './user/user.module'
import { ProjectModule } from './projects/project.module'
import { AuthenticationMiddleware } from './middlewares/authentication-middleware'
import { StatusMonitorModule } from 'nest-status-monitor'
import { MibotSessionMiddleware } from './middlewares/mibot-session.middleware'
import { HealthController } from './health.controller'
import { statusMonitorConfig } from './config/status-monitor.config'
import { RolesGuard } from './guards/roles.guard'
import { APP_GUARD } from '@nestjs/core'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Group } from './group/group.entity'
import { Role } from './role/role.entity'
import { User } from './user/user.entity'
import { ChannelModule } from './channel/channel.module'
import { ChannelConfig } from './channel/channel_config.entity'
import { Channel } from './channel/channel.entity'

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: resolve(process.cwd(), `.env${process.env.NODE_ENV ? ('.' + process.env.NODE_ENV) : ''}`)
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      entities: [Group, Role, User, Channel, ChannelConfig],
      autoLoadEntities: false,
      logging: false
    }),
    StatusMonitorModule.setUp(statusMonitorConfig),
    GroupModule,
    RoleModule,
    UserModule,
    ProjectModule,
    ChannelModule
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RolesGuard
    }
  ]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(MibotSessionMiddleware)
      .exclude('/status', '/health/(.*)')
      .forRoutes('*')
    consumer
      .apply(AuthenticationMiddleware)
      .exclude('/status', '/health/(.*)')
      .forRoutes('*')
  }
}
