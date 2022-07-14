import { Injectable } from '@nestjs/common'
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { Message } from './message.entity'
import * as httpContext from 'express-http-context'

@Injectable()
// @Injectable({ scope: Scope.REQUEST })
export class MessageApiService {
  constructor(
        @InjectDataSource('default') private dataSource: DataSource,
        @InjectRepository(Message) private messageRepo: Repository<Message>
  ) {
  }

  setSchema(schema:string) {
    this.dataSource.entityMetadatas.forEach((em, index) => {
      this.dataSource.entityMetadatas[index].schema = schema // httpContext.get('PROJECT_UID').toLowerCase()
      this.dataSource.entityMetadatas[index].tablePath = `${schema}.${em.tableName}`
    })
  }

  async save(data:Message) {
    this.setSchema('project_' + httpContext.get('PROJECT_UID').toLowerCase())

    const messageSent = await this.messageRepo.insert(data)
    data.id = messageSent.identifiers[0].id
  }

  async update(id:number, data:Message) {
    this.setSchema('project_' + httpContext.get('PROJECT_UID').toLowerCase())

    return await this.messageRepo.update(id, data)
  }

  async updateStatusBySid(sid:string, status:string) {
    this.setSchema('project_' + httpContext.get('PROJECT_UID').toLowerCase())

    return await this.messageRepo.update({ sid }, { message_status: status })
  }

  async findAll():Promise<Message[]> {
    this.setSchema('project_' + httpContext.get('PROJECT_UID').toLowerCase())

    return await this.messageRepo.find()
  }

  async findByConversationId(conversationId:number):Promise<Message[]> {
    this.setSchema('project_' + httpContext.get('PROJECT_UID').toLowerCase())

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
