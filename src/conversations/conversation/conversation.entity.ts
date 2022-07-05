import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm'

@Entity('message', { schema: 'public' })
export class Conversation {
    @PrimaryGeneratedColumn()
      id: number

    @Column()
      client_number:string

    @Column()
      client_name: string

    @Column()
      manager: string

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
