import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm'

@Entity('pointer_conversation', { schema: 'public' })
export class PointerConversation {
    @PrimaryGeneratedColumn()
      id: number

    @Column()
      phone_number: string

    @Column()
      pointer: string

    // @Column()
    //   created_by: string

    // @Column()
    //   updated_by: string

    // @Column()
    //   created_at: string

    // @Column()
    //   updated_at: string

    @Column({ default: 1 })
      status: number
}
