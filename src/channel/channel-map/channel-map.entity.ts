import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm'

@Entity('channel', { schema: 'public' })
export class ChannelMap {
    @PrimaryGeneratedColumn()
      id?: number

    @Column()
      project_uid: string

    @Column()
      channel_number: string

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
