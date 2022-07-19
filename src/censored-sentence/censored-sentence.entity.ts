import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm'

@Entity('censored_sentences', { schema: 'public' })
export class CensoredSentence {
    @PrimaryGeneratedColumn()
      id: number

    @Column()
      sentence: string

    @Column()
      description: string

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
