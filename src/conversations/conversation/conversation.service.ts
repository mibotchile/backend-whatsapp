import { Injectable } from '@nestjs/common'
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import { DataSource, ILike, Repository } from 'typeorm'
import { Message } from '../messages/message.entity'
import { Conversation } from './conversation.entity'

@Injectable()
export class ConversationService {
  schema:string
  constructor(
        @InjectDataSource('default') private dataSource: DataSource,
        @InjectRepository(Conversation) private conversationRepo: Repository<Conversation>
  ) {

  }

  setSchema(schema:string) {
    this.schema = schema
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

  async findLastMessagesByConversationIds(conversationIds:number[]):Promise<Message[]> {
    return await this.dataSource.query(`select * from (select *,ROW_NUMBER () OVER (PARTITION BY conversation_id ORDER BY created_at DESC) rn FROM ${this.schema}.message where conversation_id in (${conversationIds.join(',')}) ) as t where rn=1`)
  }

  async findLastMessageByConversationId(conversationId:number):Promise<Message> {
    const [message] = await this.dataSource.query(`select * from (select *,ROW_NUMBER () OVER (PARTITION BY conversation_id ORDER BY created_at DESC) rn FROM ${this.schema}.message where conversation_id = ${conversationId} ) as t where rn=1`)
    return message
  }

  async findByManagerWithId(manager:string, managerId:number):Promise<Conversation[]> {
    const conversations = await this.conversationRepo.find({
      where: {
        manager: `${manager}_${managerId}`
      }
    })
    if (conversations.length === 0) return []
    const conversationIds = conversations.map(c => c.id)
    const lastMessages = await this.findLastMessagesByConversationIds(conversationIds)
    return conversations.map((c:any) => {
      c.last_message = lastMessages.find(m => m.conversation_id === c.id)
      return c
    })
  }

  async findById(id:number):Promise<Conversation> {
    const [conversation] = await this.conversationRepo.find({ where: { id } }) as any
    if (!conversation) return
    const lastMessage = await this.findLastMessageByConversationId(conversation.id)
    conversation.last_message = lastMessage
    return conversation
  }

  async findByIdWithLastMessage(id:number):Promise<Conversation> {
    const [conversation] = await this.conversationRepo.find({ where: { id } }) as any
    if (!conversation) return
    const lastMessage = await this.findLastMessageByConversationId(conversation.id)
    conversation.last_message = lastMessage
    return conversation
  }
}
