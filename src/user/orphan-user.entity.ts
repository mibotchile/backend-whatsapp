import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm'

@Entity('orphan_user', { schema: 'public' })
export class OrphanUser {
    @PrimaryGeneratedColumn()
      id?: number

    @Column()
      uid: string

    @Column()
      project_uid: string

    @Column()
      client_uid: string

    @Column()
      name: string

    @Column()
      email: string

    @Column('jsonb')
      groups_id: number[]

    @Column()
      role_id: number

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
