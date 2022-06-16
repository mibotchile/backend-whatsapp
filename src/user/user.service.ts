import { HttpException, HttpStatus, Injectable, Scope } from '@nestjs/common'
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import { DataSource, ILike, In, Not, Repository } from 'typeorm'
import { User } from './user.entity'
import * as httpContext from 'express-http-context'
import { Group } from 'src/group/group.entity'

@Injectable({ scope: Scope.REQUEST })
export class UserService {
  constructor (@InjectDataSource('default')
    private dataSource: DataSource, @InjectRepository(User) private usersRepo:Repository<User>, @InjectRepository(Group) private groupsRepo: Repository<Group>) {
    this.dataSource.entityMetadatas.forEach((em, index) => {
      this.dataSource.entityMetadatas[index].schema = 'project_' + httpContext.get('PROJECT_UID')
      this.dataSource.entityMetadatas[index].tablePath = 'project_' + httpContext.get('PROJECT_UID').toLowerCase() + '.' + em.tableName
    })
  }

  async create (data: User): Promise<any> {
    const users = await this.usersRepo.find({
      where: {
        name: ILike(data.name)
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
    const data_res = await this.usersRepo.insert(data)
    return {
      data: data_res,
      success: true,
      message: 'Usuario creado exitosamente'
    }
  }

  async update (idParam:string, data: User): Promise<any> {
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
      const users = await this.usersRepo.find({
        where: {
          name: ILike(data.name),
          id: Not(id)
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

    const dataRes = await this.usersRepo.update(id, data)
    return {
      data: dataRes,
      success: true,
      message: 'Usuario actualizado exitosamente'
    }
  }

  async findAll ({ pageSize, page }): Promise<any> {
    const { users, length } = await this.getFullDataUsers(pageSize, page)
    return {
      data: {
        page,
        pageSize,
        length,
        users
      },
      success: true,
      message: 'Lista de todos los usuarios'
    }
  }

  async findInactives (pageSize = 0, page = 0): Promise<any> {
    const where = { status: 0 }
    const { users, length } = await this.getFullDataUsers(pageSize, page, where)
    return {
      data: {
        page,
        pageSize,
        length,
        users
      },
      success: true,
      message: 'Lista de usuarios inactivos'
    }
  }

  async findActives (pageSize = 0, page = 0): Promise<any> {
    const where = { status: 1 }
    const { users, length } = await this.getFullDataUsers(pageSize, page, where)
    return {
      data: {
        page,
        pageSize,
        length,
        users
      },
      success: true,
      message: 'Lista de usuarios actives'
    }
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

    const usersDB = await this.usersRepo.find({
      where,
      ...pagination,
      order: { id: 'asc' },
      relations: {
        role: true
      },
      select: {
        id: true,
        uid: true,
        email: true,
        groups_id: true
      }
    })

    if (usersDB.length === 0) {
      throw new HttpException(
        {
          data: [],
          success: false,
          message: 'No existen usuarios que coincidan'
        },
        HttpStatus.OK
      )
    }
    const length = await this.usersRepo.count(where)

    const groupIds = usersDB.reduce((pVal, cVal) => {
      pVal.push(...(cVal.groups_id as Array<number>))
      return pVal
    }, [])

    const groups = await this.groupsRepo.find({
      where: {
        id: In(groupIds)
      },
      select: {
        id: true,
        name: true
      }
    })
    const users = usersDB.map((u:any) => {
      u.groups = groups.filter(g => (u.groups_id as Array<number>).includes(g.id))
      return u
    })

    return { users, length }
  }

  async findById (id: number): Promise<any> {
    const [user] = await this.usersRepo.find({ // se uso find porque findOne genera dos consultas cuando se usa reltions https://github.com/typeorm/typeorm/issues/5694
      where: { id },
      relations: {
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
    const user = await this.usersRepo.find({
      where: { uid },
      relations: {
        role: true
      }
    })
    return {
      data: user[0],
      success: true,
      message: 'user'
    }
  }

  async findByEmail (email:string): Promise<any> {
    const user = await this.usersRepo.find({
      where: { email },
      relations: {
        role: true
      }
    })
    return {
      data: user[0],
      success: true,
      message: 'user'
    }
  }

  async findGroupsById (id:number): Promise<any> {
    const [user] = await this.usersRepo.find({
      where: { id }
    })

    const groups = await this.groupsRepo.find({
      where: {
        id: In(user.groups_id)

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
    const { users, length } = await this.getFullDataUsers(pageSize, page, where)

    return {
      data: {
        page,
        pageSize,
        length,
        users
      },
      success: true,
      message: 'Lista de usuarios'
    }
  }

  async remove (id: number) {
    const userDeleted = await this.usersRepo.update(id, { status: 0 })
    return {
      data: userDeleted,
      success: true,
      message: 'Usuario desactivado exitosamente'
    }
  }
}
