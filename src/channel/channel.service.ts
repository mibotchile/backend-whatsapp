import { Injectable } from '@nestjs/common'
import { Channel, Prisma, PrismaClient } from '@prisma/client'

@Injectable()
export class ChannelService {
  constructor (private prisma: PrismaClient) {}

  async create (data: Prisma.ChannelCreateInput): Promise<Channel> {
    return this.prisma.group.create({
      data
    })
  }

  async findAll ({ pageSize, page }): Promise<Channel[]> {
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
  }

  async findActives (pageSize = 0, page = 0): Promise<Channel[]> {
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
  }

  async findById (id: number): Promise<Channel | null> {
    return this.prisma.group.findUnique({
      where: { id }
    })
  }

  async update (id: number, data: Prisma.ChannelUpdateInput): Promise<Channel> {
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
