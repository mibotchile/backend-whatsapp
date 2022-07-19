import { Injectable } from '@nestjs/common'
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { PointerConversation } from './pointer-conversation.entity'

@Injectable()
export class PointerConversationService {
  constructor(
        @InjectDataSource('default') private dataSource: DataSource,
        @InjectRepository(PointerConversation) private pointerRepo: Repository<PointerConversation>
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

  async updateByPhoneNumber(projectUid:string, waId: string, data:PointerConversation) {
    this.setSchema(this.buildSchemaName(projectUid))
    console.log({ waId })
    console.log(data.pointer)
    await this.pointerRepo.update({ phone_number: waId }, data)
  }

  async create(projectUid:string, data:PointerConversation) {
    this.setSchema(this.buildSchemaName(projectUid))

    await this.pointerRepo.insert(data)
  }

  async delete(projectUid:string, waId: string) {
    this.setSchema(this.buildSchemaName(projectUid))
    await this.pointerRepo.update({ phone_number: waId }, { status: 0 })
  }

  async findByWaId(projectUid:string, waId: string): Promise<PointerConversation> {
    this.setSchema(this.buildSchemaName(projectUid))
    const [pointer] = await this.pointerRepo.find({ where: { phone_number: waId, status: 1 } })
    return pointer
  }
}
