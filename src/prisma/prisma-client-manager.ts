import { Injectable, OnModuleDestroy } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'
import { Request } from 'express'
import * as fs from 'node:fs'
import { resolve } from 'node:path'

@Injectable()
export class PrismaClientManager implements OnModuleDestroy {
  // the client instances cache object
  private clients: { [key: string]: PrismaClient } = {}

  async getClient(request: Request): Promise<PrismaClient> {
    const mibotSession: any = JSON.parse(request.headers.mibot_session as string)
    const tenantId = mibotSession.project_uid
    let client = this.clients[tenantId]

    const schema = !mibotSession ? 'public' : `project_${mibotSession.project_uid.toLowerCase()}`

    if (!global.schemas.includes(schema)) {
      client = new PrismaClient({
        datasources: {
          db: {
            url: `postgresql://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}?schema=public`
          }
        }
      })
      const migrations = fs.readdirSync(resolve(process.cwd(), 'prisma/migrations'))
      migrations.sort((a, b) => {
        return +b.split('_')[0] - +a.split('_')[0]
      })
      const sql: string = fs.readFileSync(resolve(process.cwd(), 'prisma/migrations', migrations[0], 'migration.sql'), { encoding: 'utf-8' })
      // console.log(sql)

      await client.$queryRawUnsafe(`CREATE SCHEMA ${schema}
      ${sql.replaceAll(';', '\n')}`)
      client.$disconnect()
      global.schemas.push(schema)
      client = null
    }

    if (!client) {
      const databaseUrl = `postgresql://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}?schema=${schema}`
      console.log('url => ', databaseUrl)

      client = new PrismaClient({
        datasources: {
          db: {
            url: databaseUrl
          }
        }
      })
      this.clients[tenantId] = client
    }

    return client
  }

  async onModuleDestroy() {
    await Promise.all(Object.values(this.clients).map((client) => client.$disconnect()))
  }
}
