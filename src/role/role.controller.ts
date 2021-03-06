import { Controller, Get, Post, Body, Put, Param, Delete, Query } from '@nestjs/common'
import { RoleService } from './role.service'
import { ApiBody, ApiHeader, ApiQuery, ApiTags } from '@nestjs/swagger'
import { RoleDto } from './role.dto'
import { Role } from './role.entity'
import * as httpContext from 'express-http-context'

@Controller('role')
@ApiTags('Roles')
@ApiHeader({ name: 'mibot_session', required: true })
@ApiHeader({
  name: 'Authorization',
  required: true,
  example: 'beareer slkjdjklskdlfkj'
})
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @ApiBody({
    type: RoleDto,
    description: 'Create new role'
  })
  async create(@Body() data: any): Promise<Role[]> {
    data.created_by = httpContext.get('USER').email
    data.updated_by = ''
    return this.roleService.create(data)
  }

  @Get()
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'pageSize', type: Number, required: false })
  async findAll(@Query() queryParams: any): Promise<Role[][]> {
    return this.roleService.findAll({
      pageSize: Number(queryParams.pageSize),
      page: Number(queryParams.page)
    })
  }

  @Get('actives')
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'pageSize', type: Number, required: false })
  async findActives(@Query() queryParams: any): Promise<Role[][]> {
    return this.roleService.findActives(Number(queryParams.pageSize), Number(queryParams.page))
  }

  @Get('inactives')
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'pageSize', type: Number, required: false })
  async findInactives(@Query() queryParams: any): Promise<Role[][]> {
    return this.roleService.findInactives(Number(queryParams.pageSize), Number(queryParams.page))
  }

  @Get('search')
  @ApiQuery({ name: 'name', type: String, required: false })
  async find(@Query() queryParams: any): Promise<Role[][]> {
    if (!queryParams.name)queryParams.name = ''
    return this.roleService.find(queryParams)
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<Role[]> {
    return this.roleService.findById(Number(id))
  }

  @Put(':id')
  @ApiBody({ type: RoleDto })
  async update(@Param('id') id: string, @Body() data: any): Promise<Role[]> {
    delete data.created_by
    data.updated_by = httpContext.get('USER').email
    return this.roleService.update(+id, data)
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.roleService.remove(+id)
  }
}
