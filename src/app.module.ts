import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { GroupModule } from './group/group.module'
import { ChannelModule } from './channel/channel.module'
import { resolve } from 'node:path'
import { PrismaModule } from './prisma/prisma.module'
import { AppService } from './app.service'

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: resolve(process.cwd(), `.env.${process.env.NODE_ENV}`)
    }),
    GroupModule,
    ChannelModule,
    PrismaModule
  ],
  providers: [AppService]
})
export class AppModule {}
