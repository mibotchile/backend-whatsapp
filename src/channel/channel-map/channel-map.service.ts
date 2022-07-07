import { Injectable, Scope } from '@nestjs/common'
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { ChannelMap } from './channel-map.entity'

@Injectable({ scope: Scope.REQUEST })
export class ChannelMapService {
  constructor (
    @InjectDataSource() private dataSource:DataSource,
    @InjectRepository(ChannelMap) private channelMapRepository: Repository<ChannelMap>) {
    this.setSchema('public')
  }

  setSchema(schema:string) {
    this.dataSource.entityMetadatas.forEach((em, index) => {
      this.dataSource.entityMetadatas[index].schema = schema
      this.dataSource.entityMetadatas[index].tablePath = `${schema}.${em.tableName}`
    })
  }

  async create (data: ChannelMap): Promise<any> {
    return await this.channelMapRepository.insert(data)
  }
}
