import { HttpException, HttpStatus, Injectable, Scope } from '@nestjs/common'
import { Group } from './group.entity'
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import { ILike, Not, Repository } from 'typeorm'
import * as httpContext from 'express-http-context'

@Injectable({ scope: Scope.REQUEST })
export class GroupService {
  private connection
  constructor (@InjectDataSource() connection, @InjectRepository(Group) private groupsRepository: Repository<Group>) {
    this.connection = connection
    // console.log(connection)
    const index = this.connection.entityMetadatas.findIndex(e => e.name === 'Group')
    this.connection.entityMetadatas[index].schema = 'project_' + httpContext.get('PROJECT_UID')
    this.connection.entityMetadatas[index].tablePath = 'project_' + httpContext.get('PROJECT_UID').toLowerCase() + '.group'
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
      throw new HttpException(
        {
          data: [],
          success: false,
          message: 'Este grupo no se puede desactivar ni editar'
        },
        HttpStatus.OK
      )
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
    }
    if (data.default) {
      await this.groupsRepository.createQueryBuilder().update().set({ default: false }).execute()
    }
    const dataRes = await this.groupsRepository.update(id, data)
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
