import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm'

@Entity('group', { schema: 'public' })
export class Group {
    @PrimaryGeneratedColumn()
      id: number

    @Column()
      name: string

    @Column()
      description: string

    @Column('jsonb')
      tags: string[]

    @Column({ default: false })
      default: boolean

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
