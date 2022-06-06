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
import { FileLoggerService } from './logger/file-logger.service'

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: resolve(process.cwd(), `.env.${process.env.NODE_ENV}`)
    }),
    GroupModule,
    ChannelModule,
    PrismaModule,
    RoleModule,
    UserModule,
    ProjectModule
  ],
  providers: [AppService, FileLoggerService]
})
// export class AppModule {}
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthenticationMiddleware)
      .forRoutes('*')
  }
}
