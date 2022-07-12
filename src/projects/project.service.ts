import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { InjectDataSource } from '@nestjs/typeorm'
import * as fs from 'node:fs'
import { resolve } from 'node:path'
import { DataSource } from 'typeorm'

@Injectable()
export class ProjectService {
  constructor (@InjectDataSource('default') private dataSource:DataSource) {}
  async create (uid:string): Promise<any> {
    const schema = `project_${uid.toLowerCase()}`
    let schemas = await this.dataSource.query('SELECT schema_name FROM information_schema.schemata where schema_name like \'project_%\'')
    schemas = schemas.map((s) => s.schema_name)
    console.log(schemas)
    if (schemas.includes(schema)) {
      throw new HttpException(
        {
          data: [],
          success: false,
          message: 'Ya existe un proyecto con el uid => ' + uid
        },
        HttpStatus.NOT_ACCEPTABLE
      )
    }

    const migrations = fs.readdirSync(resolve(process.cwd(), 'prisma/migrations'))
    migrations.sort((a, b) => {
      return +b.split('_')[0] - +a.split('_')[0]
    })
    const sql: string = fs.readFileSync(resolve(process.cwd(), 'prisma/migrations', migrations[0], 'migration.sql'), { encoding: 'utf-8' })

    const now = new Date().toISOString()
    await this.dataSource.query(`CREATE SCHEMA ${schema}
    ${sql.replaceAll(';', '\n')}`)
    await this.dataSource.query(`INSERT INTO ${schema}."group"
    (id, "name", description, tags, created_by, updated_by, created_at, updated_at, status, "default")
    VALUES(1, 'Default', 'Grupo por defecto del sistema', '["Default"]', 'System', 'system', '${now}', '${now}', 1, true);
    `)
    await this.dataSource.query(`
    INSERT INTO ${schema}."role" (id,"name",description,config,created_by,updated_by,created_at,updated_at,status,"default") values
    (1,'Root','Usuario administrador de todos los recursos','[{"name": "conversation", "tabs": [], "hasTabs": false, "childrens": [], "displayName": "Conversaciones", "permissions": ["create", "read", "update", "delete"], "hasChildrens": false, "hasPermissions": true, "permissionsToDisplay": ["Crear", "Leer", "Actualizar", "Eliminar"]}, {"name": "settings", "tabs": [{"name": "user", "displayName": "Usuarios", "permissions": ["create", "read", "update", "delete"], "hasPermissions": true, "permissionsToDisplay": ["Crear", "Leer", "Actualizar", "Eliminar"]}, {"name": "group", "displayName": "Grupos", "permissions": ["create", "read", "update", "delete"], "hasPermissions": true, "permissionsToDisplay": ["Crear", "Leer", "Actualizar", "Eliminar"]}, {"name": "channel", "displayName": "Canales", "permissions": ["create", "read", "update", "delete"], "hasPermissions": true, "permissionsToDisplay": ["Crear", "Leer", "Actualizar", "Eliminar"]}, {"name": "role", "displayName": "Roles", "permissions": ["create", "read", "update", "delete"], "hasPermissions": true, "permissionsToDisplay": ["Crear", "Leer", "Actualizar", "Eliminar"]}], "hasTabs": true, "childrens": [], "displayName": "Configuración", "permissions": [], "hasChildrens": false, "hasPermissions": false, "permissionsToDisplay": []}]','system','system','${now}','${now}',1,true),
    (2,'Supervisor','Usuario con permisos de asignar conversaciones y supervisar los procesos','[{"name": "conversation", "tabs": [], "hasTabs": false, "childrens": [], "displayName": "Conversaciones", "permissions": ["create", "read", "update"], "hasChildrens": false, "hasPermissions": true, "permissionsToDisplay": ["Crear", "Leer", "Actualizar", "Eliminar"]}, {"name": "settings", "tabs": [{"name": "user", "displayName": "Usuarios", "permissions": ["create", "read", "update"], "hasPermissions": true, "permissionsToDisplay": ["Crear", "Leer", "Actualizar", "Eliminar"]}, {"name": "group", "displayName": "Grupos", "permissions": ["create", "read", "update"], "hasPermissions": true, "permissionsToDisplay": ["Crear", "Leer", "Actualizar", "Eliminar"]}, {"name": "channel", "displayName": "Canales", "permissions": ["create", "read", "update"], "hasPermissions": true, "permissionsToDisplay": ["Crear", "Leer", "Actualizar", "Eliminar"]}, {"name": "role", "displayName": "Roles", "permissions": ["read"], "hasPermissions": true, "permissionsToDisplay": ["Crear", "Leer", "Actualizar", "Eliminar"]}], "hasTabs": true, "childrens": [], "displayName": "Configuración", "permissions": [], "hasChildrens": false, "hasPermissions": false, "permissionsToDisplay": []}]','system','system','${now}','${now}',1,false),
    (3,'Agente','Usuario para gestión operativa de conversaciones','[{"name": "settings", "tabs": [], "hasTabs": true, "childrens": [], "displayName": "Configuración", "permissions": [], "hasChildrens": false, "hasPermissions": false, "permissionsToDisplay": []}, {"name": "conversation", "tabs": [], "hasTabs": false, "childrens": [], "displayName": "Conversaciones", "permissions": ["create", "read", "update", "delete"], "hasChildrens": false, "hasPermissions": true, "permissionsToDisplay": ["Crear", "Leer", "Actualizar", "Eliminar"]}]','system','system','${now}','${now}',1,false);`)
    await this.dataSource.query(`CREATE UNIQUE INDEX ${schema}_user_uid_email ON ${schema}."user" USING btree (uid, email)`)
    await this.dataSource.query(`COMMENT ON INDEX ${schema}.${schema}_user_uid_email IS 'Llave unica para no permitir duplicidad de email y uid'`)
    await this.dataSource.query(`COMMENT ON COLUMN ${schema}.user.groups_id IS 'array de grupos a los que tiene acceso'`)
    return true
  }

  async findAll (): Promise<any> {
    return await this.dataSource.query('SELECT schema_name FROM information_schema.schemata where schema_name like \'project_%\'')
  }
}
