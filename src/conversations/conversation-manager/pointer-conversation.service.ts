import { Injectable, Scope } from '@nestjs/common'
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { PointerConversation } from './pointer-conversation.entity'
import { Config } from '../conversation.types'

@Injectable({ scope: Scope.REQUEST })
export class PointerConversationService {
  constructor(
        @InjectDataSource('default') private dataSource: DataSource,
        @InjectRepository(PointerConversation) private pointerRepo: Repository<PointerConversation>
  ) {
    this.setSchema('project_vnblnzdm0b3bdcltpvpl')
  }

  setSchema(schema:string) {
    this.dataSource.entityMetadatas.forEach((em, index) => {
      this.dataSource.entityMetadatas[index].schema = schema // httpContext.get('PROJECT_UID').toLowerCase()
      this.dataSource.entityMetadatas[index].tablePath = `${schema}.${em.tableName}`
    })
  }

  async update(waId: string, newPointer: string) {
    console.log({ waId })
    console.log({ newPointer })

    this.setSchema('project_vnblnzdm0b3bdcltpvpl')
    await this.pointerRepo.update({ phone_number: waId }, { pointer: newPointer })
  }

  async create(waId: string, newPointer: string, config:Config, conversationId:number) {
    this.setSchema('project_vnblnzdm0b3bdcltpvpl')
    await this.pointerRepo.insert({ phone_number: waId, pointer: newPointer, config, conversation_id: conversationId })
  }

  async delete(waId: string) {
    this.setSchema('project_vnblnzdm0b3bdcltpvpl')
    await this.pointerRepo.update({ phone_number: waId }, { status: 0 })
  }

  async findByWaId(waId: string): Promise<PointerConversation> {
    this.setSchema('project_vnblnzdm0b3bdcltpvpl')
    const pointers = await this.pointerRepo.find({ where: { phone_number: waId, status: 1 } })
    return pointers[0]
    // return 'step2>menu1>option3>menu2'
    // return 'step3>quiz2>question5'
  }
}
