import { Injectable, Scope } from '@nestjs/common'
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import { DataSource, ILike, Repository } from 'typeorm'
import { OrphanUser } from './orphan-user.entity'

@Injectable({ scope: Scope.REQUEST })
export class OrphanUserService {
  constructor (@InjectDataSource('default')
    private dataSource: DataSource, @InjectRepository(OrphanUser) private orphanUserRepo: Repository<OrphanUser>) {
    this.setSchema('public')
  }

  setSchema(schema:string) {
    console.log({ schema })
    this.dataSource.entityMetadatas.forEach((em, index) => {
      this.dataSource.entityMetadatas[index].schema = schema
      this.dataSource.entityMetadatas[index].tablePath = schema + '.' + em.tableName
    })
  }

  async create (data: OrphanUser): Promise<any> {
    const orphanUsers = await this.orphanUserRepo.find({
      where: {
        uid: ILike(data.uid),
        project_uid: ILike(data.project_uid),
        client_uid: ILike(data.client_uid)
      }
    })
    if (orphanUsers.length > 0) {
      throw new Error(`Ya existe un usuario huerfano con estos datos ${JSON.stringify(data)}`
      )
    }

    await this.orphanUserRepo.insert(data)
  }

  async findByUid(uid :string) {
    return await this.orphanUserRepo.find({
      where: {
        uid: ILike(uid)
      }
    })
  }

  async findByProjectUid(projectUid :string) {
    return await this.orphanUserRepo.find({
      where: {
        project_uid: ILike(projectUid)
      }
    })
  }

  async deleteById(id:number) {
    await this.orphanUserRepo.delete(id)
  }

  async deleteManyByIds(ids:number[]) {
    await this.orphanUserRepo.delete(ids)
  }

  async deleteManyByCondition(condition:any) {
    await this.orphanUserRepo.delete(condition)
  }
}
