import { HttpException, HttpStatus, Injectable, Scope } from '@nestjs/common'
import { Channel } from './channel.entity'
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import { ILike, Not, Repository } from 'typeorm'
import * as httpContext from 'express-http-context'
import * as twilio from 'twilio'

@Injectable({ scope: Scope.REQUEST })
export class ChannelService {
  private connection
  constructor (@InjectDataSource() connection/* ,@InjectRepository(Channel) private channelsRepository: Repository<Channel> */) {
    // this.connection = connection
    // console.log(connection)
    // const index = this.connection.entityMetadatas.findIndex(e => e.name === 'Channel')
    // this.connection.entityMetadatas[index].schema = 'project_' + httpContext.get('PROJECT_UID')
    // this.connection.entityMetadatas[index].tablePath = 'project_' + httpContext.get('PROJECT_UID').toLowerCase() + '.channel'
  }

  //   async create (data: Channel): Promise<any> {
  //     const channels = await this.channelsRepository.find({
  //       where: {
  //         name: ILike(data.name)
  //       }
  //     })
  //     if (channels.length > 0) {
  //       if (channels[0].status === 0) {
  //         await this.channelsRepository.update(channels[0].id, { status: 1 })
  //         throw new HttpException(
  //           {
  //             data: [],
  //             success: false,
  //             message: 'Existe un grupo con el mismo nombre desactivado y se activo'
  //           },
  //           HttpStatus.OK
  //         )
  //       }
  //       throw new HttpException(
  //         {
  //           data: [],
  //           success: false,
  //           message: 'Ya existe un grupo con el mismo nombre'
  //         },
  //         HttpStatus.NOT_ACCEPTABLE
  //       )
  //     }
  //     if (data.default) {
  //       await this.channelsRepository.createQueryBuilder().update().set({ default: false }).execute()
  //     }
  //     const data_res = await this.channelsRepository.insert(data)
  //     return {
  //       data: data_res,
  //       success: true,
  //       message: 'grupo creado exitosamente'
  //     }
  //   }

  //   async update (id: number, data: Channel): Promise<any> {
  //     if (data.name) {
  //       const channels = await this.channelsRepository.find({
  //         where: {
  //           name: ILike(data.name),
  //           id: Not(id)
  //         }
  //       })

  //       if (channels.length > 0) {
  //         if (channels[0].status === 0) {
  //           await this.channelsRepository.update(channels[0].id, { status: 1 })
  //           throw new HttpException(
  //             {
  //               data: [],
  //               success: false,
  //               message: 'Existe un grupo con el mismo nombre desactivado y se activo'
  //             },
  //             HttpStatus.OK
  //           )
  //         }
  //         throw new HttpException(
  //           {
  //             data: [],
  //             success: false,
  //             message: 'Ya existe un grupo con el mismo nombre'
  //           },
  //           HttpStatus.NOT_ACCEPTABLE
  //         )
  //       }
  //     }
  //     if (data.default) {
  //       await this.channelsRepository.createQueryBuilder().update().set({ default: false }).execute()
  //     }
  //     const dataRes = await this.channelsRepository.update(id, data)
  //     return {
  //       data: dataRes,
  //       success: true,
  //       message: 'Grupo actualozado exitosamente'
  //     }
  //   }

  async findNumbers (): Promise<any> {
    const twilioClient = twilio(
      process.env.ACCOUNT_SID,
      process.env.AUTH_TOKEN
    )
    const numbers = await twilioClient.incomingPhoneNumbers.list({
      limit: 20
    })

    const length = 20// await this.channelsRepository.createQueryBuilder().getCount()

    return {
      data: {
        page: 0,
        pageSize: 0,
        length,
        channels: numbers
      },
      success: true,
      message: 'Lista de todos los grupos'
    }
  }

  //   async findAll ({ pageSize, page }): Promise<any> {
  //     pageSize = Number(pageSize)
  //     page = Number(page)
  //     const pagination = {} as any

  //     if (!isNaN(pageSize) && !isNaN(page)) {
  //       page -= 1
  //       const skip = (page < 0 ? 0 : page) * pageSize
  //       pagination.skip = skip
  //       pagination.take = pageSize
  //     }
  //     const channels = await this.channelsRepository.find({
  //       ...pagination,
  //       order: { id: 'asc' }
  //     })
  //     const length = await this.channelsRepository.createQueryBuilder().getCount()

  //     return {
  //       data: {
  //         page,
  //         pageSize,
  //         length,
  //         channels
  //       },
  //       success: true,
  //       message: 'Lista de todos los grupos'
  //     }
  //   }

  //   async finder (pageSize = 0, page = 0, where = {}) {
  //     pageSize = Number(pageSize)
  //     page = Number(page)
  //     const pagination = {} as any

  //     if (!isNaN(pageSize) && !isNaN(page)) {
  //       page -= 1
  //       const skip = (page < 0 ? 0 : page) * pageSize
  //       pagination.skip = skip
  //       pagination.take = pageSize
  //     }
  //     const channels = await this.channelsRepository.find({
  //       ...pagination,
  //       where,
  //       order: { id: 'asc' }
  //     })
  //     if (channels.length === 0) {
  //       throw new HttpException(
  //         {
  //           data: [],
  //           success: false,
  //           message: 'No existen grupos que coincidan con '
  //         },
  //         HttpStatus.OK
  //       )
  //     }
  //     const length = await this.channelsRepository.createQueryBuilder().where('Channel.status=1').getCount()

  //     return { channels, length }
  //   }

  //   async findActives (pageSize = 0, page = 0): Promise<any> {
  //     pageSize = Number(pageSize)
  //     page = Number(page)
  //     const pagination = {} as any

  //     if (!isNaN(pageSize) && !isNaN(page)) {
  //       page -= 1
  //       const skip = (page < 0 ? 0 : page) * pageSize
  //       pagination.skip = skip
  //       pagination.take = pageSize
  //     }
  //     const channels = await this.channelsRepository.find({
  //       ...pagination,
  //       where: { status: 1 },
  //       order: { id: 'asc' }
  //     })

  //     const length = await this.channelsRepository.createQueryBuilder().where('Channel.status=1').getCount()// aggrgations._count.id
  //     return {
  //       data: {
  //         page,
  //         pageSize,
  //         length,
  //         channels
  //       },
  //       success: true,
  //       message: 'Lista de grupos activos'
  //     }
  //   }

  //   async findInactives (pageSize = 0, page = 0): Promise<any> {
  //     pageSize = Number(pageSize)
  //     page = Number(page)
  //     const pagination = {} as any

  //     if (!isNaN(pageSize) && !isNaN(page)) {
  //       page -= 1
  //       const skip = (page < 0 ? 0 : page) * pageSize
  //       pagination.skip = skip
  //       pagination.take = pageSize
  //     }
  //     const channels = await this.channelsRepository.find({
  //       ...pagination,
  //       where: { status: 0 },
  //       order: { id: 'asc' }
  //     })
  //     const length = await this.channelsRepository.createQueryBuilder().where('Channel.status=0').getCount()// aggrgations._count.id
  //     return {
  //       data: {
  //         page,
  //         pageSize,
  //         length,
  //         channels
  //       },
  //       success: true,
  //       message: 'Lista de grupos inactivos'
  //     }
  //   }

  //   async findById (id: number): Promise<any> {
  //     const channel = await this.channelsRepository.findOne({
  //       where: { id }
  //     })
  //     return {
  //       data: channel,
  //       success: true,
  //       message: 'channel'
  //     }
  //   }

  //   async find ({ pageSize, page, name }): Promise<any> {
  //     pageSize = Number(pageSize)
  //     page = Number(page)
  //     const pagination = {} as any

  //     if (!isNaN(pageSize) && !isNaN(page)) {
  //       page -= 1
  //       const skip = (page < 0 ? 0 : page) * pageSize
  //       pagination.skip = skip
  //       pagination.take = pageSize
  //     }
  //     console.log(ILike(`%${name}%`))

  //     const channels = await this.channelsRepository.find({
  //       where: {
  //         name: ILike(`%${name}%`)
  //       },
  //       ...pagination

  //     })

  //     if (channels.length === 0) {
  //       throw new HttpException(
  //         {
  //           data: [],
  //           success: false,
  //           message: 'No existen grupos que coincidan con este nombre'
  //         },
  //         HttpStatus.OK
  //       )
  //     }
  //     const length = await this.channelsRepository.createQueryBuilder().where(`Channel.name ILIKE '%${name}%'`).getCount()
  //     return {
  //       data: {
  //         page,
  //         pageSize,
  //         length,
  //         channels
  //       },
  //       success: true,
  //       message: 'user'
  //     }
  //   }

//   async remove (id: number) {
//     const channelDeleted = await this.channelsRepository.update(id, {
//       status: 0
//     })
//     return {
//       data: channelDeleted,
//       success: true,
//       message: 'Grupo desactivado aexitosamente'
//     }
//   }
}
