import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { PrismaClient, Prisma } from '@prisma/client'

@Injectable()
export class UserService {
  constructor (private prisma: PrismaClient) {}
  async create (data: Prisma.userCreateInput): Promise<any> {
    // console.log(data)
    data.created_by = 'System'
    const users = await this.prisma.user.findMany({
      where: { name: data.name }
    })
    if (users.length > 0) {
      throw new HttpException(
        {
          data: [],
          success: false,
          message: 'A user with this name already exists'
        },
        HttpStatus.NOT_ACCEPTABLE
      )
    }
    const data_res = await this.prisma.user.create({
      data
    })
    return {
      data: data_res,
      success: true,
      message: 'successfully created user'
    }
  }

  async update (id: number, data: Prisma.userUpdateInput): Promise<any> {
    const users = await this.prisma.user.findMany({
      where: { name: data.name as string, NOT: { id } }
    })

    if (users.length > 0) {
      throw new HttpException(
        {
          data: [],
          success: false,
          message: 'A user with this name already exists'
        },
        HttpStatus.NOT_ACCEPTABLE
      )
    }
    const dataRes = await this.prisma.user.update({
      data,
      where: { id }
    })
    return {
      data: dataRes,
      success: true,
      message: 'successfully updated user'
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
    const users = await this.prisma.user.findMany({
      ...pagination,
      orderBy: { id: 'asc' }
    })
    return {
      data: users,
      success: true,
      message: 'list all users'
    }
    // return this.prisma.$queryRaw`select * from "public"."User"`
  }

  async findActives (pageSize = 0, page = 0): Promise<any> {
    page -= 1
    const skip = (page < 0 ? 0 : page) * pageSize
    const pagination = {} as any
    if (!isNaN(skip)) {
      pagination.skip = skip
      pagination.take = pageSize
    }
    const users = await this.prisma.user.findMany({
      ...pagination,
      where: { status: 1 },
      orderBy: { id: 'asc' }
    })
    return {
      data: users,
      success: true,
      message: 'list actives users'
    }
    // return this.prisma.$queryRaw`select * from "public"."User"`
  }

  async findById (id: number): Promise<any> {
    const user = this.prisma.user.findUnique({
      where: { id }
    })
    return {
      data: user,
      success: true,
      message: 'user'
    }
  }

  async remove (id: number) {
    const userDeleted = await this.prisma.user.update({
      data: { status: 0 },
      where: { id }
    })
    return {
      data: userDeleted,
      success: true,
      message: 'successfully desactive user'
    }
  }
}
