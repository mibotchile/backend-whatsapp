import { Injectable, Scope } from '@nestjs/common'
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { ChannelConfig } from 'src/channel/channel-config/channel_config.entity'

@Injectable({ scope: Scope.REQUEST })
export class ChannelConfigService {
  constructor(
        @InjectDataSource('default') private dataSource: DataSource,
        @InjectRepository(ChannelConfig) private channelConfigRepo: Repository<ChannelConfig>
  ) {
    this.setSchema('project_vnblnzdm0b3bdcltpvpl')
  }

  setSchema(schema:string) {
    this.dataSource.entityMetadatas.forEach((em, index) => {
      this.dataSource.entityMetadatas[index].schema = schema // httpContext.get('PROJECT_UID').toLowerCase()
      this.dataSource.entityMetadatas[index].tablePath = `${schema}.${em.tableName}`
    })
  }

  async findByChannelNumber(phoneNumber: string): Promise<ChannelConfig> {
    const configs = await this.channelConfigRepo.find({ where: { channel_number: phoneNumber } })
    return configs[0]
  }
}
