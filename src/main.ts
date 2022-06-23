import { NestFactory } from '@nestjs/core'
import { urlencoded, json } from 'body-parser'
import { AppModule } from './app.module'
import { SwaggerModule, DocumentBuilder, SwaggerCustomOptions } from '@nestjs/swagger'
import * as cors from 'cors'
import { FileLoggerService } from './logger/file-logger.service'
import * as httpContext from 'express-http-context'
import { Transport } from '@nestjs/microservices'
import { ClientModule } from './conversations/messages-client/messages.module'
import * as fs from 'node:fs'

async function bootstrap() {
  console.log('ENV: ', process.env.ENVIROMENT)
  console.log('NODE_ENV: ', process.env.NODE_ENV)

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
  const app = await NestFactory.create(AppModule, appOptions)
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

  const app2 = await NestFactory.createMicroservice(ClientModule, {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBIT_URL],
      queue: 'whatsapp.messages.dev2',
      // noAck: false,
      queueOptions: {
        durable: true
      }
    }
  })
  await app2.listen()
}

bootstrap()
