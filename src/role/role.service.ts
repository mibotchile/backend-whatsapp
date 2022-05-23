import { Injectable } from '@nestjs/common'
import { PrismaClient, Role, Prisma } from '@prisma/client'

@Injectable()
export class RoleService {
  constructor (private prisma: PrismaClient) {}
  async create (data: Prisma.RoleCreateInput): Promise<Role> {
    // console.log(data)
    return this.prisma.role.create({
      data
    })
  }

  async findAll ({ pageSize, page }): Promise<Role[]> {
    page -= 1
    const skip = (page < 0 ? 0 : page) * pageSize
    const pagination = {} as any
    if (!isNaN(skip)) {
      pagination.skip = skip
      pagination.take = pageSize
    } else {
      pagination.take = 10
    }
    return this.prisma.role.findMany({
      ...pagination
    })
    // return this.prisma.$queryRaw`select * from "public"."Role"`
  }

  async findActives (pageSize = 0, page = 0): Promise<Role[]> {
    page -= 1
    const skip = (page < 0 ? 0 : page) * pageSize
    const pagination = {} as any
    if (!isNaN(skip)) {
      pagination.skip = skip
      pagination.take = pageSize
    } else {
      pagination.take = 10
    }
    return this.prisma.role.findMany({
      ...pagination,
      where: { status: 1 }
    })
    // return this.prisma.$queryRaw`select * from "public"."Role"`
  }

  async findById (id: number): Promise<Role | null> {
    return this.prisma.role.findUnique({
      where: { id }
    })
  }

  async update (id: number, data: Prisma.RoleUpdateInput): Promise<Role> {
    return this.prisma.role.update({
      data,
      where: { id }
    })
  }

  async remove (id: number) {
    return this.prisma.role.update({
      data: { status: 0 },
      where: { id }
    })
  }
}
