import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { InjectDataSource } from '@nestjs/typeorm'
import * as fs from 'node:fs'
import { resolve } from 'node:path'
import { DataSource } from 'typeorm'

@Injectable()
export class ProjectService {
  constructor (@InjectDataSource('default') private dataSource:DataSource) {}
  async create (uid:string, res): Promise<any> {
    const schema = `project_${uid.toLowerCase()}`
    let schemas = await this.dataSource.query('SELECT schema_name FROM information_schema.schemata where schema_name like \'project_%\'')
    schemas = schemas.map((s) => s.schema_name)
    console.log(schemas)
    if (schemas.includes(schema)) {
      throw new HttpException(
        {
          data: [],
          success: false,
          message: 'Ya existe un proyecto con este uid'
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

    await this.dataSource.query(`CREATE SCHEMA ${schema}
    ${sql.replaceAll(';', '\n')}`)
    await this.dataSource.query(`CREATE UNIQUE INDEX ${schema}_user_uid_email ON ${schema}."user" USING btree (uid, email)`)
    await this.dataSource.query(`COMMENT ON INDEX ${schema}.${schema}_user_uid_email IS 'Llave unica para no permitir duplicidad de email y uid'`)
    await this.dataSource.query(`COMMENT ON COLUMN ${schema}.user.groups_id IS 'array de grupos a los que tiene acceso'`)
    // global.schemas.push(schema)
    // console.log(global.schemas)

    res.json({
      data: [],
      success: true,
      message: 'Proyecto creado exitosamente'
    })
  }
}
