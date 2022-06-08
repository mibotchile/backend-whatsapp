import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { PrismaClient, Prisma } from '@prisma/client'

@Injectable()
export class RoleService {
  constructor (private prisma: PrismaClient) {}
  async create (data: Prisma.roleCreateInput): Promise<any> {
    if (!data.name) {
      throw new HttpException(
        {
          data: [],
          success: false,
          message: 'missing name'
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
          message: 'missing config'
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

    const roles = await this.prisma.role.findMany({
      where: { name: data.name }
    })
    if (roles.length > 0) {
      throw new HttpException(
        {
          data: [],
          success: false,
          message: 'Ya existe rol con este nombre'
        },
        HttpStatus.NOT_ACCEPTABLE
      )
    }

    try {
      const dataRes = await this.prisma.role.create({
        data
      })
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

  async update (id: number, data: Prisma.roleUpdateInput): Promise<any> {
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
      const roles = await this.prisma.role.findMany({
        where: { name: data.name as string, NOT: { id } }
      })

      if (roles.length > 0) {
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

    const dataRes = await this.prisma.role.update({
      data,
      where: { id }
    })
    return {
      data: dataRes,
      success: true,
      message: 'Rol actualizado exitosamente'
    }
  }

  async findAll ({ pageSize, page }): Promise<any> {
    page -= 1
    const skip = (page < 0 ? 0 : page) * pageSize
    const pagination = {} as any
    if (!isNaN(skip)) {
      pagination.skip = skip
      pagination.take = pageSize
    }
    const roles = await this.prisma.role.findMany({
      ...pagination,
      include: {
        users: true
      }
    })
    return {
      data: roles,
      success: true,
      message: 'Lista de todos los usuarios'
    }
  }

  async findActives (pageSize = 0, page = 0): Promise<any> {
    page -= 1
    const skip = (page < 0 ? 0 : page) * pageSize
    const pagination = {} as any
    if (!isNaN(skip)) {
      pagination.skip = skip
      pagination.take = pageSize
    }
    const roles = await this.prisma.role.findMany({
      ...pagination,
      where: { status: 1 }
    })
    return {
      data: roles,
      success: true,
      message: 'Lista de usuarios activos'
    }
  }

  async findById (id: number): Promise<any> {
    const role = await this.prisma.role.findUnique({
      where: { id }
    })
    return {
      data: role,
      success: true,
      message: 'role'
    }
  }

  async find (data): Promise<any> {
    const roles = await this.prisma.role.findMany({
      where: {
        name: {
          contains: data.name,
          mode: 'insensitive'
        }
      }
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
    return {
      data: roles,
      success: true,
      message: 'Lista de Roles'
    }
  }

  async remove (id: number) {
    const roleDeleted = await this.prisma.role.update({
      data: { status: 0 },
      where: { id }
    })
    return {
      data: roleDeleted,
      success: true,
      message: 'Usuario desactivado exitosamente'
    }
  }
}
