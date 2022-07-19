import { Controller } from '@nestjs/common'
import { MessagePattern, Payload } from '@nestjs/microservices'
import { FileLoggerService } from 'src/logger/file-logger.service'
import { ProjectService } from 'src/projects/project.service'
import { OrphanUser } from 'src/user/orphan-user.entity'
import { OrphanUserService } from 'src/user/orphan-user.service'
import { User } from 'src/user/user.entity'
import { UserService } from 'src/user/user.service'

@Controller('client')
export class AIMConsumerController {
  constructor(private projectService:ProjectService, private orphanUserService:OrphanUserService, private userService:UserService
  ) {}

  @MessagePattern()
  async getNotifications(@Payload() data: {action:string, user?:any, project?:any}) {
    // const now = new Intl.DateTimeFormat('af-ZA', { year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: 'numeric', second: 'numeric', timeZone: 'Asia/Samarkand' }).format(Date.now())
    const now = new Intl.DateTimeFormat('af-ZA', { year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: 'numeric', second: 'numeric', timeZone: 'UTC' }).format(Date.now())
    // const now = new Date().toISOString()
    const { action, user, project } = data
    console.log({ action })
    console.log('data from rabbit', data)

    if (user && user.services.whatsapp) {
      console.log('se crearan los usuarios')

      let projects = await this.projectService.findAll()
      projects = projects.map(p => p.schema_name.replace('project_', ''))
      console.log({ projects })

      const orphanUsers = await this.orphanUserService.findByUid(user.uid)

      const { clients } = user.config
      for (const client of clients) {
        for (const project of client.projects) {
          const newUser = {
            uid: user.uid,
            name: user.displayName,
            email: user.email,
            groups_id: [0],
            role_id: 0,
            created_by: 'System',
            created_at: now,
            updated_at: now,
            updated_by: '',
            status: 1
          } as any
          if (!projects.includes(project.uid.toLowerCase())) {
            if (!this.existsOrphanUser(orphanUsers, user.uid, project.uid, client.uid)) {
              newUser.project_uid = project.uid
              newUser.client_uid = client.uid
              console.log('creando usuario huerfano')
              try {
                this.orphanUserService.setSchema('public')
                await this.orphanUserService.create(newUser)
              } catch (error) {
                new FileLoggerService().error(error.message)
                console.log(error)
              }
            } else {
              console.log('ya existe este usuario huerfano')
            }
          } else {
            console.log('creando usuario normal')
            this.userService.setSchema(project.uid)
            try {
              await this.userService.create(newUser)
            } catch (error) {
              new FileLoggerService().error(error.message)
              console.log(error)
            }
          }
        }
      }
    }

    if (project && this.existWhatsappService(project.project.services)) {
      const projectUid = project.uid_project ?? project.project.uid
      await this.projectService.create(projectUid)
      await this.moveUsersToProject(projectUid)
    }
  }

  existsOrphanUser(orphanUsers:OrphanUser[], userUid:string, projectUid:string, clientUid:string) {
    return orphanUsers.some(ou => ou.client_uid === clientUid && ou.project_uid === projectUid && ou.uid === userUid)
  }

  existWhatsappService(services) {
    return services.some(s => s.name.toLowerCase() === 'whatsapp')
  }

  async moveUsersToProject(projectUid:string) {
    this.orphanUserService.setSchema('public')
    const orphanUsers = await this.orphanUserService.findByProjectUid(projectUid)
    const users = orphanUsers.map((ou):User => {
      delete ou.project_uid
      delete ou.client_uid
      return ou
    })
    this.userService.setSchema(projectUid)
    await this.userService.createMany(users)

    this.orphanUserService.setSchema('public')
    await this.orphanUserService.deleteManyByCondition({ project_uid: projectUid })
  }
}
