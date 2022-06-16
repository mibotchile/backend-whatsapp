import { Role } from 'src/role/role.entity'
import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, ManyToOne } from 'typeorm'

@Entity('user', { schema: 'public' })
export class User {
    @PrimaryGeneratedColumn()
      id: number

    @Column()
      uid: string

    @Column()
      name: string

    @Column()
      email: string

    @Column('jsonb')
      groups_id: number[]

    @Column()
      role_id: number

    @ManyToOne(() => Role, (role) => role.id)
    @JoinColumn({ name: 'role_id', referencedColumnName: 'id' })
      role:Role

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
