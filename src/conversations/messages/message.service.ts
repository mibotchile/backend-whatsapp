import { Injectable, Inject, forwardRef } from '@nestjs/common'
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { Message } from './message.entity'
import { MessageGateway } from '../messages-gateway/message.gateway'
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq'

@Injectable()
// @Injectable({ scope: Scope.REQUEST })
export class MessageService {
  projectUid:string
  constructor(
    @Inject(forwardRef(() => MessageGateway)) private readonly messageWs: MessageGateway,
        @InjectDataSource('default') private dataSource: DataSource,
        @InjectRepository(Message) private messageRepo: Repository<Message>,
        private readonly amqpConnection: AmqpConnection
  ) {
    this.setSchema('project_vnblnzdm0b3bdcltpvpl')
  }

  setSchema(schema:string) {
    if (schema.startsWith('project_')) {
      this.projectUid = schema.replace('project_', '')
    }
    this.dataSource.entityMetadatas.forEach((em, index) => {
      this.dataSource.entityMetadatas[index].schema = schema // httpContext.get('PROJECT_UID').toLowerCase()
      this.dataSource.entityMetadatas[index].tablePath = `${schema}.${em.tableName}`
    })
  }

  async save(data:Message, emitEvet = false) {
    const formaterLima = new Intl.DateTimeFormat('af-ZA', { year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: 'numeric', second: 'numeric', timeZone: 'America/Lima' })
    const formaterUTC = new Intl.DateTimeFormat('af-ZA', { year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: 'numeric', second: 'numeric', timeZone: 'UTC' })
    const now = Date.now()
    data.created_at = formaterLima.format(now)
    const messageSent = await this.messageRepo.insert(data)
    const meta = {
      ip: process.env.SERVER_IP,
      date: formaterUTC.format(now),
      origin: 'whatsapp'
    }
    data.id = messageSent.identifiers[0].id
    data.created_at = formaterUTC.format(now)
    this.amqpConnection.publish('bots_managements.dev', 'whatsapp.bi.messages.dev', { meta, data: { message: data, project_uid: this.projectUid } })
    if (emitEvet) {
      this.messageWs.emitNewMessage(data)
    }
  }

  async update(id:number, data:Message) {
    return await this.messageRepo.update(id, data)
  }

  async updateStatusBySid(sid:string, status:string) {
    return await this.messageRepo.update({ sid }, { message_status: status })
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
