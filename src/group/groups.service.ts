import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { Group, Prisma } from '@prisma/client'

@Injectable()
export class GroupService {
  constructor (private prisma: PrismaService) {}
  async create (data: Prisma.GroupCreateInput): Promise<Group> {
    // console.log(data)
    return this.prisma.group.create({
      data
    })
  }

  async findAll ({ pageSize, page }): Promise<Group[]> {
    page -= 1
    const skip = (page < 0 ? 0 : page) * pageSize
    const pagination = {} as any
    if (!isNaN(skip)) {
      pagination.skip = skip
      pagination.take = pageSize
    } else {
      pagination.take = 10
    }
    return this.prisma.group.findMany({
      ...pagination
    })
    // return this.prisma.$queryRaw`select * from "public"."Group"`
  }

  async findActives (pageSize = 0, page = 0): Promise<Group[]> {
    page -= 1
    const skip = (page < 0 ? 0 : page) * pageSize
    const pagination = {} as any
    if (!isNaN(skip)) {
      pagination.skip = skip
      pagination.take = pageSize
    } else {
      pagination.take = 10
    }
    return this.prisma.group.findMany({
      ...pagination,
      where: { status: 1 }
    })
    // return this.prisma.$queryRaw`select * from "public"."Group"`
  }

  async findById (id: number): Promise<Group | null> {
    return this.prisma.group.findUnique({
      where: { id }
    })
  }

  async update (id: number, data: Prisma.GroupUpdateInput): Promise<Group> {
    return this.prisma.group.update({
      data,
      where: { id }
    })
  }

  async remove (id: number) {
    return this.prisma.group.update({
      data: { status: 0 },
      where: { id }
    })
  }
}
