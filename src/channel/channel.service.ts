import { HttpException, HttpStatus, Injectable, Scope } from '@nestjs/common'
import { Channel } from './channel.entity'
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import { DataSource, ILike, Not, Repository } from 'typeorm'
import * as httpContext from 'express-http-context'
import * as twilio from 'twilio'
import { ChannelConfig } from './channel_config.entity'

@Injectable({ scope: Scope.REQUEST })
export class ChannelService {
  constructor (@InjectDataSource() private dataSource:DataSource, @InjectRepository(Channel) private channelRepository: Repository<Channel>, @InjectRepository(ChannelConfig) private channelConfigRepository: Repository<ChannelConfig>) {
    this.dataSource.entityMetadatas.forEach((em, index) => {
      this.dataSource.entityMetadatas[index].schema = 'project_' + httpContext.get('PROJECT_UID')
      this.dataSource.entityMetadatas[index].tablePath = 'project_' + httpContext.get('PROJECT_UID').toLowerCase() + '.' + em.tableName
    })
  }

  async create (data: Channel): Promise<any> {
    const channels = await this.channelRepository.find({
      where: {
        name: ILike(data.name)
      }
    })
    if (channels.length > 0) {
      if (channels[0].status === 0) {
        await this.channelRepository.update(channels[0].id, { status: 1 })
        throw new HttpException(
          {
            data: [],
            success: false,
            message: 'Existe un canal con el mismo nombre desactivado y se activo'
          },
          HttpStatus.OK
        )
      }
      throw new HttpException(
        {
          data: [],
          success: false,
          message: 'Ya existe un canal con el mismo nombre'
        },
        HttpStatus.NOT_ACCEPTABLE
      )
    }

    const data_res = await this.channelRepository.insert(data)
    return {
      data: data_res,
      success: true,
      message: 'grupo creado exitosamente'
    }
  }

  async createConfig (data: ChannelConfig): Promise<any> {
    const configs = await this.channelConfigRepository.find({
      where: {
        channel_id: data.channel_id
      }
    })
    if (configs.length > 0) {
      if (configs[0].status === 0) {
        await this.channelConfigRepository.update(configs[0].id, { status: 1 })
        throw new HttpException(
          {
            data: [],
            success: false,
            message: 'Existe una configuracion con el mismo channel_id desactivado y se activo'
          },
          HttpStatus.OK
        )
      }
      throw new HttpException(
        {
          data: [],
          success: false,
          message: 'Ya existe una configuracion para este canal'
        },
        HttpStatus.NOT_ACCEPTABLE
      )
    }
    if (!data.menus) data.menus = []
    if (!data.quizes)data.quizes = []
    if (!data.questions)data.questions = []
    data.status = 1

    const data_res = await this.channelConfigRepository.insert(data)
    return {
      data: data_res,
      success: true,
      message: 'canal creado exitosamente'
    }
  }

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
      message: 'Lista de todos los canales'
    }
  }

  async findConfigByChannelId (channelId:number): Promise<any> {
    const channels = await this.channelConfigRepository.find({
      where: {
        channel_id: channelId
      }
    })

    return {
      data: channels[0],
      success: true,
      message: 'Lista de todos los grupos'
    }
  }

  async findConfigByPhoneNumber (phoneNumber:string): Promise<any> {
    const channels = await this.channelConfigRepository.find({
      where: {
        channel_number: phoneNumber
      }
    })

    return {
      data: channels[0],
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
