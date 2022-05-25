import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { PrismaClient, Prisma } from '@prisma/client'

@Injectable()
export class RoleService {
  constructor (private prisma: PrismaClient) {}
  async create (data: Prisma.roleCreateInput): Promise<any> {
    data.created_by = 'System'
    const roles = await this.prisma.role.findMany({ where: { name: data.name } })
    if (roles.length > 0) {
      throw new HttpException({
        data: [],
        success: false,
        message: 'A role with this name already exists'
      }, HttpStatus.NOT_ACCEPTABLE)
    }
    const dataRes = await this.prisma.role.create({
      data
    })
    return {
      data: dataRes,
      success: true,
      message: 'successfully created role'
    }
  }

  async update (id: number, data: Prisma.roleUpdateInput): Promise<any> {
    const roles = await this.prisma.role.findMany({ where: { name: data.name as string, NOT: { id } } })

    if (roles.length > 0) {
      throw new HttpException({
        data: [],
        success: false,
        message: 'A role with this name already exists'
      }, HttpStatus.NOT_ACCEPTABLE)
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
      ...pagination
    })
    return {
      data: roles,
      success: true,
      message: 'successfully updated role'
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
      message: 'successfully updated role'
    }
  }

  async findById (id: number): Promise<any> {
    const role = this.prisma.role.findUnique({
      where: { id }
    })
    return {
      data: role,
      success: true,
      message: 'successfully updated role'
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
      message: 'successfully updated role'
    }
  }
}
