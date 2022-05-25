import { Controller, Get, Post, Body, Put, Param, Delete, Query, UseGuards } from '@nestjs/common'
import { GroupService } from './groups.service'
import { group } from '@prisma/client'
import { ApiBody, ApiHeader, ApiQuery, ApiTags } from '@nestjs/swagger'
import { GroupDto } from './group.dto'
import { RolesGuard } from 'src/guards/roles.guard'

@Controller('group')
@UseGuards(RolesGuard)
@ApiTags('Groups')
@ApiHeader({ name: 'mibot_session', required: true })
@ApiHeader({ name: 'Authorization', required: true, example: 'bearer s4lkjds54g5554sfd65sd56f654df65sd4f5we5454a654j564kjk89hgg3s545kdlfkj' })
export class GroupController {
  constructor (private readonly groupService: GroupService) {}

  @Post()
  @ApiBody({ type: GroupDto, description: 'Create new group' })
  async create (@Body() postData: any): Promise<group> {
    // const data:Prisma.GroupCreateInput = {
    //   name: postData.name,
    //   description: postData.description,
    //   tags: postData.tags,
    //   created_by: postData.userName,
    //   updated_by: '-'
    // }
    // console.log(data)
    postData.created_by = 'System'
    postData.updated_by = ''
    return this.groupService.create(postData)
  }

  @Get()
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'pageSize', type: Number, required: false })
  async findAll (@Query() queryParams: any): Promise<group[]> {
    console.log(queryParams)

    return this.groupService.findAll({
      pageSize: Number(queryParams.pageSize),
      page: Number(queryParams.page)
    })
  }

  @Get('actives')
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'pageSize', type: Number, required: false })
  async findActives (@Query() queryParams: any): Promise<group[]> {
    console.log(queryParams)
    return this.groupService.findActives(
      Number(queryParams.pageSize),
      Number(queryParams.page)
    )
  }

  @Get(':id')
  async findById (@Param('id') id: string): Promise<group> {
    console.log(id)
    return this.groupService.findById(Number(id))
  }

  @Put(':id')
  @ApiBody({ type: GroupDto })
  async update (@Param('id') id: string, @Body() data: any): Promise<group> {
    delete data.created_by
    return this.groupService.update(+id, data)
  }

  @Delete(':id')
  async remove (@Param('id') id: string) {
    return this.groupService.remove(+id)
  }
}
