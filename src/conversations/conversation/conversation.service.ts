import { Injectable } from '@nestjs/common'
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import { DataSource, ILike, Repository } from 'typeorm'
import { Conversation } from './conversation.entity'

@Injectable()
export class ConversationService {
  constructor(
        @InjectDataSource('default') private dataSource: DataSource,
        @InjectRepository(Conversation) private conversationRepo: Repository<Conversation>
  ) {
    this.setSchema('project_vnblnzdm0b3bdcltpvpl')
  }

  setSchema(schema:string) {
    this.dataSource.entityMetadatas.forEach((em, index) => {
      this.dataSource.entityMetadatas[index].schema = schema // httpContext.get('PROJECT_UID').toLowerCase()
      this.dataSource.entityMetadatas[index].tablePath = `${schema}.${em.tableName}`
    })
  }

  async save(data:Conversation) {
    return await this.conversationRepo.insert(data)
  }

  async update(id:number, data:Conversation) {
    return await this.conversationRepo.update(id, data)
  }

  async updateManager(id:number, typeManager:'system'|'user'|'group', managerId?:number) {
    return await this.conversationRepo.update(id, { manager: `${typeManager}_${managerId}` })
  }

  async updateByClientNumber(clientNumber:string, data:Conversation) {
    await this.conversationRepo.update({ client_number: clientNumber }, data)
  }

  async findAll():Promise<Conversation[]> {
    return await this.conversationRepo.find()
  }

  async findByManager(manager:string):Promise<Conversation[]> {
    return await this.conversationRepo.find({
      where: {
        manager: ILike(`${manager}%`)
      }
    })
  }

  async findByClient(clientNumber:string):Promise<Conversation[]> {
    return await this.conversationRepo.find({
      where: {
        client_number: clientNumber
      }
    })
  }

  async findByManagerWithId(manager:string, managerId:number):Promise<Conversation[]> {
    return await this.conversationRepo.find({
      where: {
        manager: `${manager}_${managerId}`
      }
    })
  }

  async findById(id:number):Promise<Conversation> {
    const [conversation] = await this.conversationRepo.find({ where: { id } })
    return conversation
  }
}
