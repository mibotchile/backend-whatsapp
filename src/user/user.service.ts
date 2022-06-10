import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { PrismaClient, Prisma } from '@prisma/client'
// import * as admin from 'firebase-admin'

@Injectable()
export class UserService {
  constructor (private prisma: PrismaClient) {}
  async create (data: Prisma.userCreateInput): Promise<any> {
    const users = await this.prisma.user.findMany({
      where: {
        name: {
          equals: data.name,
          mode: 'insensitive'
        }
      }
    })
    if (users.length > 0) {
      throw new HttpException(
        {
          data: [],
          success: false,
          message: 'Ya existe usuario con este nombre'
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
      message: 'Usuario creado exitosamente'
    }
  }

  async update (idParam:string, data: Prisma.userUpdateInput): Promise<any> {
    const id = +idParam
    if (isNaN(id)) {
      throw new HttpException(
        {
          error: [{ id: idParam }],
          success: false,
          message: 'El id deve ser un numero'
        },
        HttpStatus.NOT_ACCEPTABLE
      )
    }
    if (data.email) delete data.email
    if (data.uid) delete data.uid
    if (data.name) {
      const users = await this.prisma.user.findMany({
        where: {
          name: {
            equals: data.name as string,
            mode: 'insensitive'
          },
          NOT: { id }
        }
      })

      if (users.length > 0) {
        throw new HttpException(
          {
            data: [],
            success: false,
            message: 'Ya existe usuario con este nombre'
          },
          HttpStatus.NOT_ACCEPTABLE
        )
      }
    }

    const dataRes = await this.prisma.user.update({
      data,
      where: { id }
    })
    return {
      data: dataRes,
      success: true,
      message: 'Usuario actualizado exitosamente'
    }
  }

  async findAll ({ pageSize, page }): Promise<any> {
    const users = await this.getFullDataUsers(pageSize, page)
    return {
      data: {
        page,
        pageSize,
        length: 100,
        users
      },
      success: true,
      message: 'Lista de todos los usuarios'
    }
  }

  async findInactives (pageSize = 0, page = 0): Promise<any> {
    const where = { status: 0 }
    const users = await this.getFullDataUsers(pageSize, page, where)
    return {
      data: {
        page,
        pageSize,
        length: 100,
        users
      },
      success: true,
      message: 'Lista de usuarios inactivos'
    }
    // return this.prisma.$queryRaw`select * from "public"."User"`
  }

  async findActives (pageSize = 0, page = 0): Promise<any> {
    const where = { status: 1 }
    const users = await this.getFullDataUsers(pageSize, page, where)
    return {
      data: {
        page,
        pageSize,
        length: 100,
        users
      },
      success: true,
      message: 'Lista de usuarios actives'
    }
    // return this.prisma.$queryRaw`select * from "public"."User"`
  }

  async getFullDataUsers (pageSize, page, where = {}) {
    pageSize = Number(pageSize)
    page = Number(page)
    const pagination = {} as any

    if (!isNaN(pageSize) && !isNaN(page)) {
      page -= 1
      const skip = (page < 0 ? 0 : page) * pageSize
      pagination.skip = skip
      pagination.take = pageSize
    }

    const usersDB = await this.prisma.user.findMany({
      where,
      ...pagination,
      orderBy: { id: 'asc' },
      include: {
        role: {
          select: {
            name: true,
            id: true
          }
        }
      }
    })

    if (usersDB.length === 0) {
      throw new HttpException(
        {
          data: [],
          success: false,
          message: 'No existen usuarios que coincidan con este nombre'
        },
        HttpStatus.NOT_FOUND
      )
    }

    const groupIds = usersDB.reduce((pVal, cVal) => {
      pVal.push(...(cVal.groups_id as Array<number>))
      return pVal
    }, [])
    console.log({ groupIds })

    const groups = await this.prisma.group.findMany({
      where: {
        id: {
          in: groupIds as Array<number>
        }
      },
      select: {
        id: true,
        name: true
      }
    })

    console.log({ groups })
    const users = usersDB.map((u:any) => {
      u.groups = groups.filter(g => (u.groups_id as Array<number>).includes(g.id))
      return u
    })

    return users
  }

  async findById (id: number): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        role: true
      }
    })
    return {
      data: user,
      success: true,
      message: 'user'
    }
  }

  async findByUid (uid:string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { uid },
      include: {
        role: true
      }
    })
    return {
      data: user,
      success: true,
      message: 'user'
    }
  }

  async findGroupsById (id:number): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { id }
    })

    const groups = await this.prisma.group.findMany({
      where: {
        id: {
          in: user.groups_id as any
        }

      }
    })
    return {
      data: groups,
      success: true,
      message: 'user'
    }
  }

  async find ({ pageSize, page, name }): Promise<any> {
    const where = {
      name: {
        contains: name,
        mode: 'insensitive'
      }
    }
    const users = await this.getFullDataUsers(pageSize, page, where)

    return {
      data: {
        page,
        pageSize,
        length: 100,
        users
      },
      success: true,
      message: 'Lista de usuarios'
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
      message: 'Usuario desactivado exitosamente'
    }
  }
}
