import {
  INestApplication,
  Injectable,
  OnModuleInit,
  Scope,
  Inject
} from '@nestjs/common'
import { PrismaClient } from '@prisma/client'
// import * as httpContext from 'express-http-context'
import { Request } from 'express'
import { REQUEST } from '@nestjs/core'

@Injectable({ scope: Scope.REQUEST })
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor (@Inject(REQUEST) request: Request) {
    // console.log(`postgresql://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}?schema=public`)

    const mibotSession: any = JSON.parse(
      request.headers.mibot_session as string
    )
    const schema = !mibotSession
      ? 'public'
      : `project_${mibotSession.project_uid}`
    console.log('project', schema)

    super({
      datasources: {
        db: {
          url: `postgresql://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}?schema=${schema}`
        }
      }
    })
    console.log(this)
  }

  async onModuleInit () {
    try {
      await this.$connect()
    } catch (error) {
      console.log(error)
    }
  }

  async enableShutdownHooks (app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close()
    })
  }
}
