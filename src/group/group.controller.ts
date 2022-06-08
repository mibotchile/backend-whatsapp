import { Controller, Get, Post, Body, Put, Param, Delete, Query, HttpCode } from '@nestjs/common'
import { GroupService } from './groups.service'
import { group } from '@prisma/client'
import { ApiBody, ApiHeader, ApiQuery, ApiTags } from '@nestjs/swagger'
import { GroupDto } from './group.dto'
import * as httpContext from 'express-http-context'

@Controller('group')
@ApiTags('Groups')
@ApiHeader({ name: 'mibot_session', required: true })
@ApiHeader({
  name: 'Authorization',
  required: true,
  example: 'bearer s4lkjds54g5554sfd65sd56f654df65sd4f5we5454a654j564kjk89hgg3s545kdlfkj'
})
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post()
  @ApiBody({ type: GroupDto, description: 'Create new group' })
  async create(@Body() data: any): Promise<group> {
    data.tags = data.tags ? data.tags : []
    data.created_by = httpContext.get('USER')
    data.updated_by = ''
    return this.groupService.create(data)
  }

  @Get()
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'pageSize', type: Number, required: false })
  async findAll(@Query() queryParams: any): Promise<group[]> {
    console.log(queryParams)
    return this.groupService.findAll({
      pageSize: Number(queryParams.pageSize),
      page: Number(queryParams.page)
    })
  }

  @Get('actives')
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'pageSize', type: Number, required: false })
  async findActives(@Query() queryParams: any): Promise<group[]> {
    console.log(queryParams)
    return this.groupService.findActives(Number(queryParams.pageSize), Number(queryParams.page))
  }

  @Get('search')
  @HttpCode(403)
  @ApiQuery({ name: 'name', type: String, required: false })
  async find(@Query() queryParams: any): Promise<group[]> {
    if (!queryParams.name)queryParams.name = ''
    return this.groupService.find(queryParams)
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<group> {
    console.log(id)
    return this.groupService.findById(Number(id))
  }

  @Put(':id')
  @ApiBody({ type: GroupDto })
  async update(@Param('id') id: string, @Body() data: any): Promise<group> {
    data.updated_by = httpContext.get('USER')
    delete data.created_by
    return this.groupService.update(+id, data)
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.groupService.remove(+id)
  }
}
