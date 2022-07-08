import { HttpException, HttpStatus, Injectable, Scope } from '@nestjs/common'
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import { DataSource, ILike, Not, Repository } from 'typeorm'
import { Role } from './role.entity'
import * as httpContext from 'express-http-context'

@Injectable({ scope: Scope.REQUEST })
export class RoleService {
  constructor (@InjectDataSource('default')
  private dataSource: DataSource, @InjectRepository(Role) private rolesRepo:Repository<Role>) {
    const index = this.dataSource.entityMetadatas.findIndex(e => e.name === 'Role')
    this.dataSource.entityMetadatas[index].schema = 'project_' + httpContext.get('PROJECT_UID')
    this.dataSource.entityMetadatas[index].tablePath = 'project_' + httpContext.get('PROJECT_UID').toLowerCase() + '.role'
  }

  async create (data:Role): Promise<any> {
    if (!data.name) {
      throw new HttpException(
        {
          data: [],
          success: false,
          message: 'El parametro nombre no puede ser vacio'
        },
        HttpStatus.NOT_ACCEPTABLE
      )
    }
    if (!data.description) {
      data.description = ''
    }
    if (!data.config) {
      throw new HttpException(
        {
          data: [],
          success: false,
          message: 'No existe el parametro config'
        },
        HttpStatus.NOT_ACCEPTABLE
      )
    }

    if (typeof (data.config) === 'string') {
      throw new HttpException(
        {
          error: [{ config: data.config }],
          success: false,
          message: 'El parametro config deve ser de tipo JSON'
        },
        HttpStatus.NOT_ACCEPTABLE
      )
    }
    data.config = this.roleConfigValidator(data.config)

    const roles = await this.rolesRepo.find({
      where: {
        name: ILike(`%${data.name}%`)
      }
    })
    if (roles.length > 0) {
      if (roles[0].status === 0) {
        await this.rolesRepo.update(roles[0].id, { status: 1 })
        throw new HttpException(
          {
            data: [],
            success: false,
            message: 'Existe un grupo con el mismo nombre desactivado y se activo'
          },
          HttpStatus.OK
        )
      }
      throw new HttpException(
        {
          data: [],
          success: false,
          message: 'Ya existe rol con este nombre'
        },
        HttpStatus.NOT_ACCEPTABLE
      )
    }
    if (data.default) {
      await this.rolesRepo.createQueryBuilder().update().set({ default: false }).execute()
    }
    data.config = this.roleConfigValidator(data.config)
    try {
      const dataRes = await this.rolesRepo.insert(data)
      return {
        data: dataRes,
        success: true,
        message: 'Rol creado exitosamente'
      }
    } catch (error) {
      throw new HttpException(
        {
          error,
          success: false,
          message: 'Error al crear el nuevo rol'
        },
        HttpStatus.NOT_ACCEPTABLE
      )
    }
  }

  async update (id: number, data: Role): Promise<any> {
    if ([1, 2, 3].includes(id)) {
      throw new HttpException(
        {
          data: [],
          success: false,
          message: 'Este rol no se puede desactivar ni editar'
        },
        HttpStatus.OK
      )
    }
    if (isNaN(id)) {
      throw new HttpException(
        {
          error: [{ id }],
          success: false,
          message: 'El id no es valido'
        },
        HttpStatus.NOT_ACCEPTABLE
      )
    }
    if (data.config && typeof (data.config) === 'string') {
      throw new HttpException(
        {
          error: [{ config: data.config }],
          success: false,
          message: 'El parametro config deve ser de tipo JSON'
        },
        HttpStatus.NOT_ACCEPTABLE
      )
    }

    if (data.name) {
      const roles = await this.rolesRepo.find({
        where: {
          name: ILike(data.name),
          id: Not(id)
        }
      })

      if (roles.length > 0) {
        if (roles[0].status === 0) {
          await this.rolesRepo.update(roles[0].id, { status: 1 })
          throw new HttpException(
            {
              data: [],
              success: false,
              message: 'Existe un grupo con el mismo nombre desactivado y se activo'
            },
            HttpStatus.OK
          )
        }

        throw new HttpException(
          {
            data: [],
            success: false,
            message: 'Ya existe rol con este nombre'
          },
          HttpStatus.NOT_ACCEPTABLE
        )
      }
    }
    if (data.default) {
      await this.rolesRepo.createQueryBuilder().update().set({ default: false }).execute()
    }
    data.config = this.roleConfigValidator(data.config)
    const dataRes = await this.rolesRepo.update(id, data)
    return {
      data: dataRes,
      success: true,
      message: 'Rol actualizado exitosamente'
    }
  }

  async findAll ({ pageSize, page }): Promise<any> {
    pageSize = Number(pageSize)
    page = Number(page)
    const pagination = {} as any

    if (!isNaN(pageSize) && !isNaN(page)) {
      page -= 1
      const skip = (page < 0 ? 0 : page) * pageSize
      pagination.skip = skip
      pagination.take = pageSize
    }
    const roles = await this.rolesRepo.find({
      ...pagination,
      include: {
        users: true
      }
    })

    const length = await this.rolesRepo.createQueryBuilder().getCount()
    return {
      data: {
        page,
        pageSize,
        length,
        roles
      },
      success: true,
      message: 'Lista de todos los usuarios'
    }
  }

  async findActives (pageSize = 0, page = 0): Promise<any> {
    pageSize = Number(pageSize)
    page = Number(page)
    const pagination = {} as any

    if (!isNaN(pageSize) && !isNaN(page)) {
      page -= 1
      const skip = (page < 0 ? 0 : page) * pageSize
      pagination.skip = skip
      pagination.take = pageSize
    }
    const roles = await this.rolesRepo.find({
      ...pagination,
      where: { status: 1 }
    })

    const length = await this.rolesRepo.createQueryBuilder().where('Role.status=1').getCount()
    return {
      data: {
        page,
        pageSize,
        length,
        roles
      },
      success: true,
      message: 'Lista de usuarios activos'
    }
  }

  async findInactives (pageSize = 0, page = 0): Promise<any> {
    pageSize = Number(pageSize)
    page = Number(page)
    const pagination = {} as any

    if (!isNaN(pageSize) && !isNaN(page)) {
      page -= 1
      const skip = (page < 0 ? 0 : page) * pageSize
      pagination.skip = skip
      pagination.take = pageSize
    }
    const roles = await this.rolesRepo.find({
      ...pagination,
      where: { status: 0 }
    })

    const length = await this.rolesRepo.createQueryBuilder().where('Role.status=0').getCount()
    return {
      data: {
        page,
        pageSize,
        length,
        roles
      },
      success: true,
      message: 'Lista de usuarios activos'
    }
  }

  async findById (id: number): Promise<any> {
    const role = await this.rolesRepo.findOne({
      where: { id }
    })
    return {
      data: role,
      success: true,
      message: 'role'
    }
  }

  async find ({ pageSize, page, name }): Promise<any> {
    pageSize = Number(pageSize)
    page = Number(page)
    const pagination = {} as any

    if (!isNaN(pageSize) && !isNaN(page)) {
      page -= 1
      const skip = (page < 0 ? 0 : page) * pageSize
      pagination.skip = skip
      pagination.take = pageSize
    }
    const roles = await this.rolesRepo.find({
      where: {
        name: ILike(`%${name}%`)
      },
      ...pagination
    })

    if (roles.length === 0) {
      throw new HttpException(
        {
          data: [],
          success: false,
          message: 'ya existe rol con este nombre'
        },
        HttpStatus.NO_CONTENT
      )
    }

    const length = await this.rolesRepo.createQueryBuilder().where(`Role.name ILIKE '%${name}%'`).getCount()
    return {
      data: {
        page,
        pageSize,
        length,
        roles
      },
      success: true,
      message: 'Lista de Roles'
    }
  }

  async remove (id: number) {
    const roleDeleted = await this.rolesRepo.update(id, { status: 0 })
    return {
      data: roleDeleted,
      success: true,
      message: 'Usuario desactivado exitosamente'
    }
  }

  roleConfigValidator(config) {
    config = config.map(c => {
      c.tabs = c.tabs.filter(t => t.permissions.length !== 0)
      return c
    })
    return config
  }
}
