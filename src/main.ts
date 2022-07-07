import { NestFactory } from '@nestjs/core'
import { urlencoded, json } from 'body-parser'
import { AppModule } from './app.module'
import { SwaggerModule, DocumentBuilder, SwaggerCustomOptions } from '@nestjs/swagger'
import * as cors from 'cors'
import { FileLoggerService } from './logger/file-logger.service'
import * as httpContext from 'express-http-context'
import { Transport } from '@nestjs/microservices'
import { MessagesConsumerModule } from './conversations/messages-consumer/messages-consumer.module'
import * as fs from 'node:fs'
import { AIMConsumerModule } from './aim-consumer/aim-consumer.module'
import { ExtendedSocketIoAdapter } from './io-adapter/io.adapter'
import { NestExpressApplication } from '@nestjs/platform-express'

async function bootstrap() {
  console.log('NODE_ENV: ', process.env.NODE_ENV)

  // main app
  const appOptions = {
    logger: new FileLoggerService()
  } as any
  if ((process.env.SSL && process.env.SSL === 'true') || process.env.NODE_ENV === 'production') {
    console.log('SSL ENABLED')
    appOptions.httpsOptions = {
      key: fs.readFileSync(process.env.SSL_KEY),
      cert: fs.readFileSync(process.env.SSL_CERT)
    }
  }
  const app = await NestFactory.create<NestExpressApplication>(AppModule, appOptions)

  app.use(cors({ credentials: true, origin: true }))
  app.use(httpContext.middleware)

  const config = new DocumentBuilder().setTitle('API WHATSAPP').setDescription('Description').setVersion('1.0').build()
  const document = SwaggerModule.createDocument(app, config, {
    ignoreGlobalPrefix: true
  })
  const customOptions: SwaggerCustomOptions = {
    swaggerOptions: {
      persistAuthorization: true
    },
    customSiteTitle: 'API Docs'
  }
  SwaggerModule.setup('api', app, document, customOptions)
  app.use(urlencoded({ extended: true }))
  app.use(json())

  await app.listen(process.env.APP_PORT || 3000)

  //
  //
  //
  //

  // consumer for whatsapp messages

  const messagesConsumer = await NestFactory.createMicroservice(MessagesConsumerModule, {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBIT_URL],
      queue: process.env.RABBIT_WHATSAPP_MESSAGES_QUEUE,
      // noAck: false,
      queueOptions: {
        durable: true
      }
    }
  })
  messagesConsumer.useWebSocketAdapter(new ExtendedSocketIoAdapter())
  await messagesConsumer.listen()

  // consumer for create or update projects and users

  const aimConsumer = await NestFactory.createMicroservice(AIMConsumerModule, {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBIT_URL],
      queue: process.env.RABBIT_AIM_ACTIONS_QUEUE,
      noAck: false,
      queueOptions: {
        durable: true
      }
    }
  })
  await aimConsumer.listen()
}

bootstrap()
