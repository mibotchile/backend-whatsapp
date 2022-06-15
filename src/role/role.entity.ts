import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm'

@Entity('role', { schema: 'public' })
export class Role {
    @PrimaryGeneratedColumn()
      id: number

    @Column()
      name: string

    @Column()
      description: string

    @Column('jsonb')
      config: string[]

    @Column({ default: false })
      default: boolean

    @Column()
      created_by: string

    @Column()
      updated_by: string

    @Column({ default: new Intl.DateTimeFormat('af-ZA', { year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: 'numeric', second: 'numeric' }).format(Date.now()) })
      created_at: string

    @Column({ default: new Intl.DateTimeFormat('af-ZA', { year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: 'numeric', second: 'numeric' }).format(Date.now()) })
      updated_at: string

    @Column({ default: 1 })
      status: number
}
