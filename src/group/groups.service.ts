import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { PrismaClient, Prisma } from '@prisma/client'

@Injectable()
export class GroupService {
  constructor (private prisma: PrismaClient) {}
  async create (data: Prisma.groupCreateInput): Promise<any> {
    // console.log(data)
    const groups = await this.prisma.group.findMany({
      where: {
        name: {
          equals: data.name,
          mode: 'insensitive'
        }
      }
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
    if (data.default) {
      await this.prisma.group.updateMany({ data: { default: false } })
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
    if (data.name) {
      const groups = await this.prisma.group.findMany({
        where: {
          name: {
            equals: data.name as string,
            mode: 'insensitive'
          },
          NOT: { id }
        }
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
    }
    if (data.default) {
      await this.prisma.group.updateMany({ data: { default: false } })
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
    pageSize = Number(pageSize)
    page = Number(page)
    const pagination = {} as any

    if (!isNaN(pageSize) && !isNaN(page)) {
      page -= 1
      const skip = (page < 0 ? 0 : page) * pageSize
      pagination.skip = skip
      pagination.take = pageSize
    }
    const groups = await this.prisma.group.findMany({
      ...pagination,
      orderBy: { id: 'asc' }
    })
    const aggrgations = await this.prisma.group.aggregate({
      _count: { id: true }
    })
    const length = aggrgations._count.id
    return {
      data: {
        page,
        pageSize,
        length,
        groups
      },
      success: true,
      message: 'Lista de todos los grupos'
    }
    // return this.prisma.$queryRaw`select * from "public"."Group"`
  }

  async finder (pageSize = 0, page = 0, where = {}) {
    pageSize = Number(pageSize)
    page = Number(page)
    const pagination = {} as any

    if (!isNaN(pageSize) && !isNaN(page)) {
      page -= 1
      const skip = (page < 0 ? 0 : page) * pageSize
      pagination.skip = skip
      pagination.take = pageSize
    }
    const groups = await this.prisma.group.findMany({
      ...pagination,
      where: { status: 1 },
      orderBy: { id: 'asc' },
      include: {
        _count: {
          select: {
            id: true
          }
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
    const length = groups[0]

    return { groups, length }
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
    const groups = await this.prisma.group.findMany({
      ...pagination,
      where: { status: 1 },
      orderBy: { id: 'asc' }
    })
    const aggrgations = await this.prisma.group.aggregate({
      _count: { id: true },
      where: { status: 1 }
    })
    const length = aggrgations._count.id
    return {
      data: {
        page,
        pageSize,
        length,
        groups
      },
      success: true,
      message: 'Lista de grupos activos'
    }
    // return this.prisma.$queryRaw`select * from "public"."Group"`
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
    const groups = await this.prisma.group.findMany({
      ...pagination,
      where: { status: 0 },
      orderBy: { id: 'asc' }
    })
    const aggrgations = await this.prisma.group.aggregate({
      _count: { id: true },
      where: { status: 0 }
    })
    const length = aggrgations._count.id
    return {
      data: {
        page,
        pageSize,
        length,
        groups
      },
      success: true,
      message: 'Lista de grupos inactivos'
    }
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

    const groups = await this.prisma.group.findMany({
      where: {
        name: {
          contains: name,
          mode: 'insensitive'
        }
      },
      ...pagination
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
    const aggrgations = await this.prisma.group.aggregate({
      where: {
        name: {
          contains: name,
          mode: 'insensitive'
        }
      },
      _count: { id: true }
    })
    const length = aggrgations._count.id
    return {
      data: {
        page,
        pageSize,
        length,
        groups
      },
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
