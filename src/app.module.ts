import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { GroupModule } from './group/group.module'
import { ChannelModule } from './channel/channel.module'
import { resolve } from 'node:path'
import { PrismaModule } from './prisma/prisma.module'
import { AppService } from './app.service'
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

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: resolve(process.cwd(), `.env.${process.env.NODE_ENV}`)
    }),
    StatusMonitorModule.setUp(statusMonitorConfig),
    GroupModule,
    ChannelModule,
    PrismaModule,
    RoleModule,
    UserModule,
    ProjectModule
  ],
  controllers: [HealthController],
  providers: [AppService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard
    }]
})
// export class AppModule {}
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
