import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm'
import { Config } from '../conversation.types'

@Entity('pointer_conversation', { schema: 'public' })
export class PointerConversation {
    @PrimaryGeneratedColumn()
      id?: number

    @Column()
      phone_number: string

    @Column()
      pointer: string

    @Column({ type: 'jsonb' })
      config: Config

    @Column()
      conversation_id:number

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
