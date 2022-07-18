import { Injectable } from '@nestjs/common'
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import { DataSource, ILike, Repository } from 'typeorm'
import { Message } from '../messages/message.entity'
import { Conversation } from './conversation.entity'

@Injectable()
export class ConversationService {
  constructor(
        @InjectDataSource('default') private dataSource: DataSource,
        @InjectRepository(Conversation) private conversationRepo: Repository<Conversation>
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

  async save(projectUid:string, data:Conversation) {
    this.setSchema(this.buildSchemaName(projectUid))

    return await this.conversationRepo.insert(data)
  }

  async update(projectUid:string, id:number, data:Conversation) {
    this.setSchema(this.buildSchemaName(projectUid))

    return await this.conversationRepo.update(id, data)
  }

  async updateManager(projectUid:string, id:number, typeManager:'system'|'user'|'group', managerId?:number) {
    this.setSchema(this.buildSchemaName(projectUid))

    return await this.conversationRepo.update(id, { manager: `${typeManager}_${managerId}` })
  }

  async updateByClientNumber(projectUid:string, clientNumber:string, data:Conversation) {
    this.setSchema(this.buildSchemaName(projectUid))

    await this.conversationRepo.update({ client_number: clientNumber }, data)
  }

  async findAll(projectUid:string):Promise<Conversation[]> {
    this.setSchema(this.buildSchemaName(projectUid))

    return await this.conversationRepo.find()
  }

  async findByManager(projectUid:string, manager:string):Promise<Conversation[]> {
    this.setSchema(this.buildSchemaName(projectUid))

    return await this.conversationRepo.find({
      where: {
        manager: ILike(`${manager}%`)
      }
    })
  }

  async findByClient(projectUid:string, clientNumber:string):Promise<Conversation[]> {
    this.setSchema(this.buildSchemaName(projectUid))

    return await this.conversationRepo.find({
      where: {
        client_number: clientNumber
      }
    })
  }

  async findLastMessagesByConversationIds(projectUid:string, conversationIds:number[]):Promise<Message[]> {
    const schema = this.buildSchemaName(projectUid)
    this.setSchema(schema)
    return await this.dataSource.query(`select * from (select *,ROW_NUMBER () OVER (PARTITION BY conversation_id ORDER BY created_at DESC) rn FROM ${schema}.message where conversation_id in (${conversationIds.join(',')}) ) as t where rn=1`)
  }

  async findLastMessageByConversationId(projectUid:string, conversationId:number):Promise<Message> {
    const schema = this.buildSchemaName(projectUid)
    this.setSchema(schema)

    const [message] = await this.dataSource.query(`select * from (select *,ROW_NUMBER () OVER (PARTITION BY conversation_id ORDER BY created_at DESC) rn FROM ${schema}.message where conversation_id = ${conversationId} ) as t where rn=1`)
    return message
  }

  async findByManagerWithId(projectUid:string, manager:string, managerId:number):Promise<Conversation[]> {
    this.setSchema(this.buildSchemaName(projectUid))

    const conversations = await this.conversationRepo.find({
      where: {
        manager: `${manager}_${managerId}`
      }
    })
    if (conversations.length === 0) return []
    const conversationIds = conversations.map(c => c.id)
    const lastMessages = await this.findLastMessagesByConversationIds(projectUid, conversationIds)
    return conversations.map((c:any) => {
      c.last_message = lastMessages.find(m => m.conversation_id === c.id)
      return c
    })
  }

  async findById(projectUid:string, id:number):Promise<Conversation> {
    this.setSchema(this.buildSchemaName(projectUid))

    const [conversation] = await this.conversationRepo.find({ where: { id } }) as any
    if (!conversation) return
    const lastMessage = await this.findLastMessageByConversationId(projectUid, conversation.id)
    conversation.last_message = lastMessage
    return conversation
  }

  async findByIdWithLastMessage(projectUid:string, id:number):Promise<Conversation> {
    this.setSchema(this.buildSchemaName(projectUid))

    const [conversation] = await this.conversationRepo.find({ where: { id } }) as any
    if (!conversation) return
    const lastMessage = await this.findLastMessageByConversationId(projectUid, conversation.id)
    conversation.last_message = lastMessage
    return conversation
  }
}
