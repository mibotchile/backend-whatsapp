import { Injectable } from '@nestjs/common'
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { ChannelConfig } from 'src/channel/channel-config/channel_config.entity'

@Injectable()
export class ChannelConfigService {
  constructor(
        @InjectDataSource('default') private dataSource: DataSource,
        @InjectRepository(ChannelConfig) private channelConfigRepo: Repository<ChannelConfig>
  ) {
  }

  setSchema(schema:string) {
    this.dataSource.entityMetadatas.forEach((em, index) => {
      this.dataSource.entityMetadatas[index].schema = schema
      this.dataSource.entityMetadatas[index].tablePath = `${schema}.${em.tableName}`
    })
  }

  buildSchemaName(projectUid:string):string {
    const schemaName = 'project_' + projectUid.toLowerCase()
    return schemaName
  }

  async findByChannelNumber(projectUid:string, phoneNumber: string): Promise<ChannelConfig> {
    this.setSchema(this.buildSchemaName(projectUid))

    const configs = await this.channelConfigRepo.find({ where: { channel_number: phoneNumber } })
    return configs[0]
  }
}
