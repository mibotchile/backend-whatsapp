import { Menu, Message, Quiz, Redirect, Step } from 'src/conversations/conversation.types'
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm'

@Entity('channel_config', { schema: 'public' })
export class ChannelConfig {
    @PrimaryGeneratedColumn()
      id: number

    @Column()
      channel_id: number

    @Column()
      channel_number: string

    @Column('jsonb')
      menus: Menu[]

    @Column('jsonb')
      messages: Message[]

    @Column('jsonb')
      quizes: Quiz[]

    @Column('jsonb')
      steps: Step[]

    @Column('jsonb')
      redirects: Redirect[]

    @Column()
      created_by: string

    @Column()
      updated_by: string

    @Column()
      created_at: string

    @Column()
      updated_at: string

    @Column({ default: 1 })
      status: number
}
