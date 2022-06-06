import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { PrismaClient, Prisma } from '@prisma/client'

@Injectable()
export class RoleService {
  constructor (private prisma: PrismaClient) {}
  async create (data: Prisma.roleCreateInput): Promise<any> {
    data.created_by = 'System'

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
          message: 'the config parameter sees to be of type json'
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
          message: 'A role with this name already exists'
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
        message: 'successfully created role'
      }
    } catch (error) {
      throw new HttpException(
        {
          error,
          success: false,
          message: 'Error to create new role'
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
          message: 'id is no availible'
        },
        HttpStatus.NOT_ACCEPTABLE
      )
    }
    if (data.config && typeof (data.config) === 'string') {
      throw new HttpException(
        {
          error: [{ config: data.config }],
          success: false,
          message: 'the config parameter sees to be of type json'
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
            message: 'A role with this name already exists'
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
      message: 'successfully updated role'
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
      message: 'lis of all roles'
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
      message: 'list of actives roles'
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
          message: 'there are no roles matching this name'
        },
        HttpStatus.NO_CONTENT
      )
    }
    return {
      data: roles,
      success: true,
      message: 'list of roles'
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
      message: 'successfully desactive role'
    }
  }
}
