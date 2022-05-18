import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ConfigModule } from '@nestjs/config'
import { TwilioModule } from './twilio/twilio.module'
import { MessageController } from './message/message.controller'
import { MessageService } from './message/message.service'
import { GroupModule } from './group/group.module'
import { ChannelModule } from './channel/channel.module'
import { resolve } from 'node:path'

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: resolve(process.cwd(), `.env.${process.env.NODE_ENV}`)
    }),
    TwilioModule,
    GroupModule,
    ChannelModule
  ],
  controllers: [AppController, MessageController],
  providers: [AppService, MessageService]
})
export class AppModule {}
