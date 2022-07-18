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
    this.setSchema('project_vnblnzdm0b3bdcltpvpl')
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
    const pointers = await this.pointerRepo.find({ where: { phone_number: waId, status: 1 } })
    return pointers[0]
    // return 'step2>menu1>option3>menu2'
    // return 'step3>quiz2>question5'
  }
}
