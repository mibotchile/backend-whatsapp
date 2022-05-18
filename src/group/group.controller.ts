import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query
} from '@nestjs/common'
import { GroupService } from './groups.service'
import { Group /*, Prisma */ } from '@prisma/client'

@Controller('group')
export class GroupController {
  constructor (private readonly groupService: GroupService) {}

  @Post()
  async create (@Body() postData: any): Promise<Group> {
    // const data:Prisma.GroupCreateInput = {
    //   name: postData.name,
    //   description: postData.description,
    //   tags: postData.tags,
    //   created_by: postData.userName,
    //   updated_by: '-'
    // }
    postData.updated_by = ''
    return this.groupService.create(postData)
  }

  @Get()
  async findAll (@Query() queryParams: any): Promise<Group[]> {
    console.log(queryParams)

    return this.groupService.findAll({
      pageSize: Number(queryParams.pageSize),
      page: Number(queryParams.page)
    })
  }

  @Get('actives')
  async findActives (@Query() queryParams: any): Promise<Group[]> {
    console.log(queryParams)

    return this.groupService.findActives(
      Number(queryParams.pageSize),
      Number(queryParams.page)
    )
  }

  @Get(':id')
  async findById (@Param('id') id: string): Promise<Group> {
    console.log(id)
    return this.groupService.findById(Number(id))
  }

  @Put(':id')
  async update (@Param('id') id: string, @Body() data: any): Promise<Group> {
    delete data.created_by
    return this.groupService.update(+id, data)
  }

  @Delete(':id')
  async remove (@Param('id') id: string) {
    return this.groupService.remove(+id)
  }
}
