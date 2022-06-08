import { NestFactory } from '@nestjs/core'
import { urlencoded, json } from 'body-parser'
import { AppModule } from './app.module'
import { SwaggerModule, DocumentBuilder, SwaggerCustomOptions } from '@nestjs/swagger'
import * as cors from 'cors'
import { FileLoggerService } from './logger/file-logger.service'
import * as httpContext from 'express-http-context'
// import { RolesGuard } from './guards/roles.guard'

async function bootstrap() {
  console.log('ENV: ', process.env.ENVIROMENT)
  console.log('NODE_ENV: ', process.env.NODE_ENV)
  const app = await NestFactory.create(AppModule, {
    logger: new FileLoggerService()
  })
  // app.useGlobalGuards(new RolesGuard())
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
}

bootstrap()
