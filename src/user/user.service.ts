import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { PrismaClient, Prisma } from '@prisma/client'
// import * as admin from 'firebase-admin'

@Injectable()
export class UserService {
  constructor (private prisma: PrismaClient) {}
  async create (data: Prisma.userCreateInput): Promise<any> {
    // console.log(data)
    const users = await this.prisma.user.findMany({
      where: { name: data.name }
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
    const users = await this.prisma.user.findMany({
      where: { name: data.name as string, NOT: { id } }
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
      message: 'Lista de todos los usuarios'
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

  async find (data): Promise<any> {
    const users = await this.prisma.user.findMany({
      where: {
        name: {
          contains: data.name,
          mode: 'insensitive'
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
