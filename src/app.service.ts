import { Injectable } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class AppService {
  constructor () {
    const databaseUrl = `postgresql://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}?schema=public`
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl
        }
      }
    })
    console.log(databaseUrl)

    let schemas
    prisma.$queryRaw`SELECT schema_name FROM information_schema.schemata where schema_name like 'project_%'`.then((data:any) => {
      schemas = data.map(s => s.schema_name)
      global.schemas = schemas
      console.log(schemas)
    })
  }
}
