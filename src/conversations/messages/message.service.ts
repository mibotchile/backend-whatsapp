import { Injectable, Scope } from '@nestjs/common'
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { Message } from './message.entity'

@Injectable({ scope: Scope.REQUEST })
export class MessageService {
  constructor(
        @InjectDataSource('default') private dataSource: DataSource,
        @InjectRepository(Message) private messageRepo: Repository<Message>
  ) {
    this.setSchema('project_vnblnzdm0b3bdcltpvpl')
  }

  setSchema(schema:string) {
    this.dataSource.entityMetadatas.forEach((em, index) => {
      this.dataSource.entityMetadatas[index].schema = schema // httpContext.get('PROJECT_UID').toLowerCase()
      this.dataSource.entityMetadatas[index].tablePath = `${schema}.${em.tableName}`
    })
  }

  async save(data:Message) {
    await this.messageRepo.insert(data)
  }

  async update(id:number, data:Message) {
    await this.messageRepo.update(id, data)
  }

  async findAll():Promise<Message[]> {
    return await this.messageRepo.find()
  }

  async findByConversationId(conversationId:number):Promise<Message[]> {
    return await this.messageRepo.find({
      where: {
        conversation_id: conversationId
      }
    })
  }

//   async findClientNumber(clientNumber:number):Promise<Message[]> {
//     return await this.messageRepo.find({where:{
//         clien
//     }})
//   }
}
