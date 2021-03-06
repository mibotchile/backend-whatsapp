import { Controller, Get, Post, Body, Put, Param, Delete, Query } from '@nestjs/common'
import { UserService } from './user.service'
import { ApiBody, ApiHeader, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger'
import { UserDto, UserResponse } from './user.dto'
import * as httpContext from 'express-http-context'
import { User } from './user.entity'

@Controller('user')
@ApiTags('Users')
@ApiHeader({ name: 'mibot_session', required: true })
@ApiHeader({
  name: 'Authorization',
  required: true,
  example: 'bearer s4lkjds54g5554sfd65sd56f654df65sd4f5we5454a654j564kjk89hgg3s545kdlfkj'
})
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiBody({ type: UserDto, description: 'Create new user' })
  async create(@Body() data: any): Promise<User> {
    data.groups_id = data.groups_id ? data.groups_id : []
    data.created_by = httpContext.get('USER').email
    data.updated_by = ''
    return this.userService.create(data)
  }

  @Get()
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'pageSize', type: Number, required: false })
  async findAll(@Query() queryParams: any): Promise<User[]> {
    return this.userService.findAll({
      pageSize: Number(queryParams.pageSize),
      page: Number(queryParams.page)
    })
  }
  
  @Get('customToken')
  findCustomToken(): any {
    return {data:httpContext.get('CUSTOM_TOKEN'),success:true,message:'success'}
  }


  @Get('actives')
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'pageSize', type: Number, required: false })
  async findActives(@Query() queryParams: any): Promise<User[]> {
    return this.userService.findActives(Number(queryParams.pageSize), Number(queryParams.page))
  }

  @Get('inactives')
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'pageSize', type: Number, required: false })
  async findInactives(@Query() queryParams: any): Promise<User[]> {
    return this.userService.findInactives(Number(queryParams.pageSize), Number(queryParams.page))
  }

  @Get('search')
  @ApiQuery({ name: 'name', type: String, required: false })
  async find(@Query() queryParams: any): Promise<User> {
    if (!queryParams.name)queryParams.name = ''
    return this.userService.find(queryParams)
  }

  @Get('id/:id')
  async findById(@Param('id') id: string): Promise<User> {
    return this.userService.findById(Number(id))
  }

  @Get('uid/:uid')
  async findByUid(@Param('uid') uid: string): Promise<User> {
    return this.userService.findByUid(uid)
  }

  @ApiResponse({
    type: UserResponse
  })
  @Get(':id/groups')
  async findGroupsById(@Param('id') id: string): Promise<User> {
    return this.userService.findGroupsById(Number(id))
  }

  @Put(':id')
  @ApiBody({ type: UserDto })
  async update(@Param('id') id: string, @Body() data: any): Promise<User> {
    data.updated_by = httpContext.get('USER').email
    delete data.created_by
    return this.userService.update(id, data)
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.userService.remove(+id)
  }
}
