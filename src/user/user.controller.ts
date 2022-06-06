import { Controller, Get, Post, Body, Put, Param, Delete, Query } from '@nestjs/common'
import { UserService } from './user.service'
import { user } from '@prisma/client'
import { ApiBody, ApiHeader, ApiQuery, ApiTags } from '@nestjs/swagger'
import { UserDto } from './user.dto'

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
  async create(@Body() data: any): Promise<user> {
    // const data:Prisma.UserCreateInput = {
    //   name: data.name,
    //   description: data.description,
    //   tags: data.tags,
    //   created_by: data.userName,
    //   updated_by: '-'
    // }
    // console.log(data)
    data.groups_id = data.groups_id ? data.groups_id : []

    data.created_by = 'System'
    data.updated_by = ''
    return this.userService.create(data)
  }

  @Get()
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'pageSize', type: Number, required: false })
  async findAll(@Query() queryParams: any): Promise<user[]> {
    console.log(queryParams)
    return this.userService.findAll({
      pageSize: Number(queryParams.pageSize),
      page: Number(queryParams.page)
    })
  }

  @Get('actives')
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'pageSize', type: Number, required: false })
  async findActives(@Query() queryParams: any): Promise<user[]> {
    console.log(queryParams)
    return this.userService.findActives(Number(queryParams.pageSize), Number(queryParams.page))
  }

  @Get('search')
  @ApiQuery({ name: 'name', type: String, required: false })
  async find(@Query() queryParams: any): Promise<user> {
    if (!queryParams.name)queryParams.name = ''
    return this.userService.find(queryParams)
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<user> {
    console.log(id)
    return this.userService.findById(Number(id))
  }

  @Put(':id')
  @ApiBody({ type: UserDto })
  async update(@Param('id') id: string, @Body() data: any): Promise<user> {
    data.updated_by = 'Jenri'
    delete data.created_by
    return this.userService.update(id, data)
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.userService.remove(+id)
  }
}
