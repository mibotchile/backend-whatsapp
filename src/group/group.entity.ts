import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm'
import * as httpContext from 'express-http-context'

// @Entity('group')
// @Entity('group', { schema: 'project_' + httpContext.get('PROJECT_UID') })
@Entity('group', { schema: 'project_juasjuas' })
export class Group {
  constructor() {
    console.log('Entidaddd   ...', 'project_' + httpContext.get('PROJECT_UID'))
    console.log('calse grupo entidadi', this)
  }

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

    @Column({ default: new Intl.DateTimeFormat('af-ZA', { year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: 'numeric', second: 'numeric' }).format(Date.now()) })
      created_at: string

    @Column({ default: new Intl.DateTimeFormat('af-ZA', { year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: 'numeric', second: 'numeric' }).format(Date.now()) })
      updated_at: string

    @Column({ default: 1 })
      status: number
}
