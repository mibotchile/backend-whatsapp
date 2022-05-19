import { NestFactory } from '@nestjs/core'
import { urlencoded, json } from 'body-parser'
import { AppModule } from './app.module'
import { MibotSessionMiddleware } from './middlewares/mibot-session.middleware'
import { SwaggerModule, DocumentBuilder, SwaggerCustomOptions } from '@nestjs/swagger'

async function bootstrap () {
  console.log('ENV: ', process.env.ENVIROMENT)
  console.log('NODE_ENV: ', process.env.NODE_ENV)
  const app = await NestFactory.create(AppModule)

  const config = new DocumentBuilder()
    .setTitle('API WHATSAPP')
    .setDescription('Description')
    .setVersion('1.0')
    .build()

  const document = SwaggerModule.createDocument(app, config, { ignoreGlobalPrefix: true })
  const customOptions: SwaggerCustomOptions = {
    swaggerOptions: {
      persistAuthorization: true
    },
    customSiteTitle: 'API Docs'
  }
  SwaggerModule.setup('api', app, document, customOptions)

  app.use(urlencoded({ extended: true }))
  app.use(json())
  app.use(new MibotSessionMiddleware().use)
  await app.listen(process.env.APP_PORT || 3000)
}
bootstrap()
