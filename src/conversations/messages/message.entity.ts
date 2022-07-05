import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm'

@Entity('message', { schema: 'public' })
export class Message {
    @PrimaryGeneratedColumn()
      id?: number

      @Column()
        sid: string

    @Column()
      conversation_id:number

    @Column()
      content_type: string

    @Column()
      message: string

    @Column()
      media_url: string

    @Column()
      from_client: boolean

    @Column()
      message_status: string

    @Column()
      created_at: string

    @Column()
      created_by: string

    @Column({ default: 1 })
      status: number
}
