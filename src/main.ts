import { NestFactory } from '@nestjs/core'
import { urlencoded, json } from 'body-parser'
import { AppModule } from './app.module'
import { MibotSessionMiddleware } from './middlewares/mibot-session.middleware'

async function bootstrap () {
  console.log('ENV: ', process.env.ENVIROMENT)
  console.log('node_ENV: ', process.env.NODE_ENV)
  console.log(
    `${process.cwd()}/${
      process.env.NODE_ENV === 'production' ? '.env' : '.env.development'
    }`
  )

  const app = await NestFactory.create(AppModule)
  app.use(urlencoded({ extended: true }))
  app.use(json())
  app.use(new MibotSessionMiddleware().use)
  await app.listen(process.env.APP_PORT || 3000)
  console.log('ENV: ', process.env.ENVIROMENT)
}
bootstrap()
