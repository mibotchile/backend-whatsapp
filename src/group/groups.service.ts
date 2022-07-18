import { HttpException, HttpStatus, Injectable, Scope } from '@nestjs/common'
import { Group } from './group.entity'
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import { DataSource, ILike, In, Not, Repository } from 'typeorm'
import * as httpContext from 'express-http-context'
import { ChannelConfig } from 'src/channel/channel-config/channel_config.entity'

@Injectable({ scope: Scope.REQUEST })
export class GroupService {
  constructor (
    @InjectDataSource() private dataSource:DataSource,
     @InjectRepository(Group) private groupsRepository: Repository<Group>,
     @InjectRepository(ChannelConfig) private channelConfigRepo: Repository<ChannelConfig>
  ) {
    const schema = httpContext.get('PROJECT_UID') ? ('project_' + httpContext.get('PROJECT_UID').toLowerCase()) : 'public'
    this.setSchema(schema)
  }

  setSchema(schema:string) {
    this.dataSource.entityMetadatas.forEach((em, index) => {
      this.dataSource.entityMetadatas[index].schema = schema
      this.dataSource.entityMetadatas[index].tablePath = `${schema}.${em.tableName}`
    })
  }

  async create (data: Group): Promise<any> {
    const groups = await this.groupsRepository.find({
      where: {
        name: ILike(data.name)
      }
    })
    if (groups.length > 0) {
      if (groups[0].status === 0) {
        await this.groupsRepository.update(groups[0].id, { status: 1 })
        throw new HttpException(
          {
            data: [],
            success: false,
            message: 'Existe un grupo con el mismo nombre desactivado y se activo'
          },
          HttpStatus.OK
        )
      }
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
      await this.groupsRepository.createQueryBuilder().update().set({ default: false }).execute()
    }
    const data_res = await this.groupsRepository.insert(data)
    return {
      data: data_res,
      success: true,
      message: 'grupo creado exitosamente'
    }
  }

  async update (id: number, data: Group): Promise<any> {
    if (id === 1) {
      this.showHttpException('Este grupo no se puede desactivar ni editar', HttpStatus.NOT_ACCEPTABLE)
    }

    if (data.name) {
      const groups = await this.groupsRepository.find({
        where: {
          name: ILike(data.name),
          id: Not(id)
        }
      })

      if (groups.length > 0) {
        if (groups[0].status === 0) {
          await this.groupsRepository.update(groups[0].id, { status: 1 })
          this.showHttpException('Existe un grupo con el mismo nombre desactivado y se activo', HttpStatus.OK)
        }
        this.showHttpException('Ya existe un grupo con el mismo nombre', HttpStatus.NOT_ACCEPTABLE)
      }
    }

    if (data.status !== undefined && data.status === 1) {
      if (data.default) {
        await this.groupsRepository.createQueryBuilder().update().set({ default: false }).execute()
      }
      if (data.default === false) {
        const [group] = await this.groupsRepository.find({ where: { id } })
        if (group.default) {
          data.default = true
        }
      }
    }
    if (data.status !== undefined && data.status === 0) {
      data.default = false
      await this.groupsRepository.update(1, { default: true })
    }

    const dataRes = await this.groupsRepository.update(id, data)
    return {
      data: dataRes,
      success: true,
      message: 'Grupo actualizado exitosamente'
    }
  }

  async findManyByIds (ids:number[]): Promise<any> {
    if (ids.length === 0) return []
    const groups = await this.groupsRepository.find({
      where: {
        id: In(ids)
      }
    })
    return groups
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
    const groups = await this.groupsRepository.find({
      ...pagination,
      order: { id: 'asc' }
    })
    const length = await this.groupsRepository.createQueryBuilder().getCount()

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
    const groups = await this.groupsRepository.find({
      ...pagination,
      where,
      order: { id: 'asc' }
    })
    if (groups.length === 0) {
      throw new HttpException(
        {
          data: [],
          success: false,
          message: 'No existen grupos que coincidan con '
        },
        HttpStatus.OK
      )
    }
    const length = await this.groupsRepository.createQueryBuilder().where('Group.status=1').getCount()

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
    const groups = await this.groupsRepository.find({
      ...pagination,
      where: { status: 1 },
      order: { id: 'asc' }
    })

    const length = await this.groupsRepository.createQueryBuilder().where('Group.status=1').getCount()// aggrgations._count.id
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
    const groups = await this.groupsRepository.find({
      ...pagination,
      where: { status: 0 },
      order: { id: 'asc' }
    })
    const length = await this.groupsRepository.createQueryBuilder().where('Group.status=0').getCount()// aggrgations._count.id
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
    const group = await this.groupsRepository.findOne({
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
    console.log(ILike(`%${name}%`))

    const groups = await this.groupsRepository.find({
      where: {
        name: ILike(`%${name}%`)
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
    const length = await this.groupsRepository.createQueryBuilder().where(`Group.name ILIKE '%${name}%'`).getCount()
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

  async disable (id: number) {
    if (id === 1) {
      this.showHttpException('Este grupo no se puede eliminar', HttpStatus.NOT_ACCEPTABLE)
    }

    const [group] = await this.groupsRepository.find({ where: { id } })
    if (group.default) {
      await this.groupsRepository.update(1, { default: true })
    }
    const channelConfigs = await this.channelConfigRepo.find()

    const configsWithReference:string[] = []
    channelConfigs.forEach(cc => {
      cc.redirects.forEach(r => {
        const [manager, managerId] = r.to.split('.')
        if (manager === 'group' && Number(managerId) === id) {
          configsWithReference.push(cc.channel_number)
        }
      })
    })

    if (configsWithReference.length !== 0) {
      throw new HttpException(
        {
          data: [],
          success: false,
          message: `No se puede desactivar el grupo porque está asignado en la configuración del canal (${configsWithReference.join(' , ')})`
        },
        HttpStatus.NOT_ACCEPTABLE
      )
    }
    const groupDeleted = await this.groupsRepository.update(id, {
      status: 0,
      default: false
    })
    return {
      data: groupDeleted,
      success: true,
      message: 'Grupo desactivado aexitosamente'
    }
  }

  showHttpException(message:string, status:HttpStatus) {
    throw new HttpException(
      {
        data: [],
        success: false,
        message
      },
      status
    )
  }

  async remove (id: number) {
    const groupDeleted = await this.groupsRepository.update(id, {
      status: 0
    })
    return {
      data: groupDeleted,
      success: true,
      message: 'Grupo desactivado aexitosamente'
    }
  }
}
