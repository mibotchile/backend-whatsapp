import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { PrismaClient, Prisma } from '@prisma/client'

@Injectable()
export class GroupService {
  constructor (private prisma: PrismaClient) {}
  async create (data: Prisma.groupCreateInput): Promise<any> {
    // console.log(data)
    const groups = await this.prisma.group.findMany({
      where: { name: data.name }
    })
    if (groups.length > 0) {
      throw new HttpException(
        {
          data: [],
          success: false,
          message: 'Ya existe un grupo con el mismo nombre'
        },
        HttpStatus.NOT_ACCEPTABLE
      )
    }
    const data_res = await this.prisma.group.create({
      data
    })
    return {
      data: data_res,
      success: true,
      message: 'grupo creado exitosamente'
    }
  }

  async update (id: number, data: Prisma.groupUpdateInput): Promise<any> {
    const groups = await this.prisma.group.findMany({
      where: { name: data.name as string, NOT: { id } }
    })

    if (groups.length > 0) {
      throw new HttpException(
        {
          data: [],
          success: false,
          message: 'Ya existe un grupo con el mismo nombre'
        },
        HttpStatus.NOT_ACCEPTABLE
      )
    }
    const dataRes = await this.prisma.group.update({
      data,
      where: { id }
    })
    return {
      data: dataRes,
      success: true,
      message: 'Grupo actualozado exitosamente'
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
    const groups = await this.prisma.group.findMany({
      ...pagination,
      orderBy: { id: 'asc' }
    })
    return {
      data: groups,
      success: true,
      message: 'Lista de todos los grupos'
    }
    // return this.prisma.$queryRaw`select * from "public"."Group"`
  }

  async findActives (pageSize = 0, page = 0): Promise<any> {
    page -= 1
    const skip = (page < 0 ? 0 : page) * pageSize
    const pagination = {} as any
    if (!isNaN(skip)) {
      pagination.skip = skip
      pagination.take = pageSize
    }
    const groups = await this.prisma.group.findMany({
      ...pagination,
      where: { status: 1 },
      orderBy: { id: 'asc' }
    })
    return {
      data: groups,
      success: true,
      message: 'Lista de grupos activos'
    }
    // return this.prisma.$queryRaw`select * from "public"."Group"`
  }

  async findById (id: number): Promise<any> {
    const group = await this.prisma.group.findUnique({
      where: { id }
    })
    return {
      data: group,
      success: true,
      message: 'group'
    }
  }

  async find (data): Promise<any> {
    const groups = await this.prisma.group.findMany({
      where: {
        name: {
          contains: data.name,
          mode: 'insensitive'
        }
      }
    })

    if (groups.length === 0) {
      throw new HttpException(
        {
          data: [],
          success: false,
          message: 'No existen grupos que coincidan con este nombre'
        },
        HttpStatus.OK
      )
    }
    return {
      data: groups,
      success: true,
      message: 'user'
    }
  }

  async remove (id: number) {
    const groupDeleted = await this.prisma.group.update({
      data: { status: 0 },
      where: { id }
    })
    return {
      data: groupDeleted,
      success: true,
      message: 'Grupo desactivado aexitosamente'
    }
  }
}
