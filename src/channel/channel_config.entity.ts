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
      menus: string[]

    @Column('jsonb')
      messages: string[]

    @Column('jsonb')
      quizes: string[]

    @Column('jsonb')
      questions: string[]

    @Column('jsonb')
      steps: string[]

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
