import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { PrismaClient, Prisma } from '@prisma/client'
// import * as admin from 'firebase-admin'

@Injectable()
export class UserService {
  constructor (private prisma: PrismaClient) {}
  async create (data: Prisma.userCreateInput): Promise<any> {
    // console.log(data)
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
    // const userRecord = await admin.auth().createUser({
    //   email: data.email,
    //   emailVerified: false,
    //   password: 'secretPassword',
    //   displayName: data.name,
    //   disabled: false
    // })

    // data.uid = userRecord.uid
    // console.log('Successfully created new user:', userRecord.uid)
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
    pageSize = Number(pageSize)
    page = Number(page)
    const pagination = {} as any

    if (!isNaN(pageSize) && !isNaN(page)) {
      page -= 1
      const skip = (page < 0 ? 0 : page) * pageSize
      pagination.skip = skip
      pagination.take = pageSize
    }
    const users = await this.prisma.user.findMany({
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
    return {
      data: users,
      success: true,
      message: 'Lista de todos los usuarios'
    }
    // return this.prisma.$queryRaw`select * from "public"."User"`
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
    const users = await this.prisma.user.findMany({
      ...pagination,
      where: { status: 1 },
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
    return {
      data: users,
      success: true,
      message: 'Lista de usuarios actives'
    }
    // return this.prisma.$queryRaw`select * from "public"."User"`
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
    pageSize = Number(pageSize)
    page = Number(page)
    const pagination = {} as any

    if (!isNaN(pageSize) && !isNaN(page)) {
      page -= 1
      const skip = (page < 0 ? 0 : page) * pageSize
      pagination.skip = skip
      pagination.take = pageSize
    }

    const users = await this.prisma.user.findMany({
      where: {
        name: {
          contains: name,
          mode: 'insensitive'
        }
      },
      ...pagination,
      include: {
        role: {
          select: {
            name: true,
            id: true
          }
        }
      }
    })
    if (users.length === 0) {
      throw new HttpException(
        {
          data: [],
          success: false,
          message: 'No existen usuarios que coincidan con este nombre'
        },
        HttpStatus.NO_CONTENT
      )
    }

    return {
      data: users,
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
