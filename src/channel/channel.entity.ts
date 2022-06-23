import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm'

@Entity('channel', { schema: 'public' })
export class Channel {
    @PrimaryGeneratedColumn()
      id: number

    @Column()
      phone_number: string

    @Column()
      name: string

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
