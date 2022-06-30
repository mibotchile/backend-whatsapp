import { Controller, Param, Post } from '@nestjs/common'
import { ProjectService } from './project.service'
import { ApiHeader, ApiTags } from '@nestjs/swagger'

@Controller('project')
@ApiTags('Projects')
@ApiHeader({ name: 'mibot_session', required: true })
@ApiHeader({
  name: 'Authorization',
  required: true,
  example: 'bearer s4lkjds54g5554sfd65sd56f654df65sd4f5we5454a654j564kjk89hgg3s545kdlfkj'
})
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post('/:uid')
  async create(@Param('uid') uid:string): Promise<any> {
    return this.projectService.create(uid)
  }
}
