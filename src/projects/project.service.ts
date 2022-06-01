import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'
import * as fs from 'node:fs'
import { resolve } from 'node:path'

@Injectable()
export class ProjectService {
  constructor (private prisma: PrismaClient) {}
  async create (res): Promise<any> {
    const schema = !res.locals.PROJECT_UID ? 'public' : `project_${res.locals.PROJECT_UID.toLowerCase()}`

    if (global.schemas.includes(schema)) {
      throw new HttpException(
        {
          data: [],
          success: false,
          message: 'A project with this uid already exists'
        },
        HttpStatus.NOT_ACCEPTABLE
      )
    }

    const migrations = fs.readdirSync(resolve(process.cwd(), 'prisma/migrations'))
    migrations.sort((a, b) => {
      return +b.split('_')[0] - +a.split('_')[0]
    })
    const sql: string = fs.readFileSync(resolve(process.cwd(), 'prisma/migrations', migrations[0], 'migration.sql'), { encoding: 'utf-8' })
    // console.log(sql)

    await this.prisma.$queryRawUnsafe(`CREATE SCHEMA ${schema}
    ${sql.replaceAll(';', '\n')}`)
    await this.prisma.$queryRawUnsafe(`CREATE UNIQUE INDEX ${schema}_user_uid_email ON ${schema}."user" USING btree (uid, email)`)
    await this.prisma.$queryRawUnsafe(`COMMENT ON INDEX ${schema}.${schema}_user_uid_email IS 'Llave unica para no permitir duplicidad de email y uid'`)
    await this.prisma.$queryRawUnsafe(`COMMENT ON COLUMN ${schema}.user.groups_id IS 'array de grupos a los que tiene acceso'`)
    global.schemas.push(schema)
    console.log(global.schemas)

    res.json({
      data: [],
      success: true,
      message: 'successfully created project'
    })
  }
}
