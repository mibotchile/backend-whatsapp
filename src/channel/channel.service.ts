import { HttpException, HttpStatus, Injectable, Scope } from '@nestjs/common'
import { Channel } from './channel.entity'
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import { DataSource, ILike, Repository } from 'typeorm'
import * as httpContext from 'express-http-context'
import * as twilio from 'twilio'
import { ChannelConfig } from './channel-config/channel_config.entity'
import { ChannelMapService } from './channel-map/channel-map.service'
import { ChannelConfigUtils } from 'src/conversations/conversation-manager/channel-config.utils'
import { GroupService } from 'src/group/groups.service'
import { UserService } from 'src/user/user.service'
import { User } from 'src/user/user.entity'
import { Group } from 'src/group/group.entity'

@Injectable({ scope: Scope.REQUEST })
export class ChannelService {
  configUtils:ChannelConfigUtils

  constructor (
    @InjectDataSource() private dataSource:DataSource,
    @InjectRepository(Channel) private channelRepository: Repository<Channel>,
    @InjectRepository(ChannelConfig) private channelConfigRepository: Repository<ChannelConfig>,
    private channelMapService:ChannelMapService,
    private groupService:GroupService,
    private userService:UserService) {
    const schema = httpContext.get('PROJECT_UID') ? ('project_' + httpContext.get('PROJECT_UID').toLowerCase()) : 'public'
    this.setSchema(schema)
    this.configUtils = new ChannelConfigUtils()
  }

  setSchema(schema:string) {
    this.dataSource.entityMetadatas.forEach((em, index) => {
      this.dataSource.entityMetadatas[index].schema = schema
      this.dataSource.entityMetadatas[index].tablePath = `${schema}.${em.tableName}`
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
    await this.channelMapService.create({ project_uid: httpContext.get('PROJECT_UID'), channel_number: data.phone_number, created_at: data.created_at, created_by: data.created_by, updated_at: data.updated_at, updated_by: data.updated_by, status: 1 })
    return {
      data: data_res,
      success: true,
      message: 'canal creado exitosamente'
    }
  }

  async update (id:number, data: Channel): Promise<any> {
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

    const data_res = await this.channelRepository.update(id, data)
    return {
      data: data_res,
      success: true,
      message: 'canal actualizado exitosamente'
    }
  }

  async createConfig (data: ChannelConfig): Promise<any> {
    // const configs = await this.channelConfigRepository.find({
    //   where: {
    //     channel_id: data.channel_id
    //   }
    // })
    // if (configs.length > 0) {
    //   if (configs[0].status === 0) {
    //     await this.channelConfigRepository.update(configs[0].id, { status: 1 })
    //     throw new HttpException(
    //       {
    //         data: [],
    //         success: false,
    //         message: 'Existe una configuracion con el mismo channel_id desactivado y se activo'
    //       },
    //       HttpStatus.OK
    //     )
    //   }
    //   throw new HttpException(
    //     {
    //       data: [],
    //       success: false,
    //       message: 'Ya existe una configuracion para este canal'
    //     },
    //     HttpStatus.NOT_ACCEPTABLE
    //   )
    // }
    if (!data.channel_id) data.channel_id = 1
    if (!data.menus) data.menus = []
    if (!data.quizes)data.quizes = []
    if (!data.redirects)data.redirects = []
    data.status = 1

    const data_res = await this.channelConfigRepository.insert(data)
    return {
      data: data_res,
      success: true,
      message: 'configuracion de canal creada exitosamente'
    }
  }

  async updateConfig (phoneNumber:string, data: ChannelConfig): Promise<any> {
    // const configs = await this.channelConfigRepository.find({
    //   where: {
    //     channel_id: data.channel_id
    //   }
    // })
    // if (configs.length > 0) {
    //   if (configs[0].status === 0) {
    //     await this.channelConfigRepository.update(configs[0].id, { status: 1 })
    //     throw new HttpException(
    //       {
    //         data: [],
    //         success: false,
    //         message: 'Existe una configuracion con el mismo channel_id desactivado y se activo'
    //       },
    //       HttpStatus.OK
    //     )
    //   }
    //   throw new HttpException(
    //     {
    //       data: [],
    //       success: false,
    //       message: 'Ya existe una configuracion para este canal'
    //     },
    //     HttpStatus.NOT_ACCEPTABLE
    //   )
    // }

    const data_res = await this.channelConfigRepository.update({ channel_number: phoneNumber }, data)
    return {
      data: data_res,
      success: true,
      message: 'configuracion de canal actualizado exitosamente'
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
    const channels = await this.channelRepository.find()
    // const twilioClient = twilio(
    //   process.env.ACCOUNT_SID,
    //   process.env.AUTH_TOKEN
    // )
    // const numbers = await twilioClient.incomingPhoneNumbers.list({
    //   limit: 20
    // })

    const length = 20// await this.channelsRepository.createQueryBuilder().getCount()

    return {
      data: {
        page: 0,
        pageSize: 0,
        length,
        channels
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
      message: 'Canal obtenido exitosamente'
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
      message: 'Canal obtenido exitosamente'
    }
  }

  async prettierConfig(config: ChannelConfig):Promise<any> {
    if (!config.steps) {
      throw new HttpException(
        {
          data: [],
          success: false,
          message: 'No existe una configuracion para este canal'
        },
        HttpStatus.NOT_ACCEPTABLE
      )
    }
    const prettyConfig = []
    const { steps, redirects } = config
    const usersRedirect = redirects.filter(r => r.to.includes('user'))
    const groupsRedirect = redirects.filter(r => r.to.includes('group'))
    const userIds = usersRedirect.length > 0 ? usersRedirect.map(r => Number(r.to.replace('user.', ''))) : []
    const groupIds = groupsRedirect.length > 0 ? groupsRedirect.map(r => Number(r.to.replace('group.', ''))) : []
    const users = await this.userService.findManyByIds(userIds)
    const groups = await this.groupService.findManyByIds(groupIds)

    steps.forEach(s => {
      prettyConfig.push(...this.buildData(s.action, config, users, groups))
    })

    return prettyConfig
  }

  buildData(action:string, config:ChannelConfig, users:User[], groups:Group[]) {
    const [item, itemId] = action.split('.')
    console.log(item)
    const messageResponse = []
    switch (item) {
      case 'menu':
        const menu = config.menus.find(m => m.id === Number(itemId))
        const options = menu.options
        const m = { title: menu.title } as any
        const op = []
        options.forEach(o => {
          op.push(...this.buildData(o.action, config, users, groups))
        })
        m.options = op
        messageResponse.push({ type: 'menu', data: m })
        break
      case 'message':
        const message = config.messages.find(m => m.id === Number(itemId))
        messageResponse.push({ type: 'message', data: message.message })
        break
      case 'redirect':
        const redirect = config.redirects.find(r => r.id === Number(itemId))
        const [manager, managerId] = redirect.to.split('.')
        let managerName
        let managerType
        if (manager === 'group') {
          managerType = 'grupo'
          managerName = groups.find(g => g.id === Number(managerId)).name
        }
        if (manager === 'user') {
          managerType = 'usuario'
          managerName = users.find(u => u.id === Number(managerId)).name
        }
        messageResponse.push({ type: 'redirect', data: 'Transferencia al ' + managerType + ' ' + managerName })
        break
      case 'quiz':
        const quiz = config.quizes.find(q => q.id === Number(itemId))
        const questions = quiz.questions.map(q => q.question)
        messageResponse.push({ type: 'data_request', data: questions })

        break
    }
    return messageResponse
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
