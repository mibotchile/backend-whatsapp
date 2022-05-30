import { Controller, Get, Post, Body, Put, Param, Delete, Query } from '@nestjs/common'
import { RoleService } from './role.service'
import { role } from '@prisma/client'
import { ApiBody, ApiHeader, ApiQuery, ApiTags } from '@nestjs/swagger'
import { RoleDto } from './role.dto'

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
  async create(@Body() data: any): Promise<role> {
    data.created_by = 'System'
    data.updated_by = ''
    return this.roleService.create(data)
  }

  @Get()
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'pageSize', type: Number, required: false })
  async findAll(@Query() queryParams: any): Promise<role[]> {
    console.log(queryParams)

    return this.roleService.findAll({
      pageSize: Number(queryParams.pageSize),
      page: Number(queryParams.page)
    })
  }

  @Get('actives')
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'pageSize', type: Number, required: false })
  async findActives(@Query() queryParams: any): Promise<role[]> {
    console.log(queryParams)
    return this.roleService.findActives(Number(queryParams.pageSize), Number(queryParams.page))
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<role> {
    console.log(id)
    return this.roleService.findById(Number(id))
  }

  @Put(':id')
  @ApiBody({ type: RoleDto })
  async update(@Param('id') id: string, @Body() data: any): Promise<role> {
    delete data.created_by
    data.updated_by = 'fernando'
    return this.roleService.update(+id, data)
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.roleService.remove(+id)
  }
}
