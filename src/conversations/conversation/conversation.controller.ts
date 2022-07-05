import { Controller, Get, Post, Body, Put, Param, Delete, Query } from '@nestjs/common'
import { ConversationService } from './conversation.service'
import { ApiBody, ApiHeader, ApiQuery, ApiTags, PickType } from '@nestjs/swagger'

import { Conversation } from './conversation.entity'
import * as httpContext from 'express-http-context'

@Controller('conversation')
@ApiTags('Conversations')
@ApiHeader({ name: 'mibot_session', required: true })
@ApiHeader({
  name: 'Authorization',
  required: true,
  example: 'beareer slkjdjklskdlfkj'
})
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  //   @Post()
  //   @ApiBody({
  //     type: Conversation,
  //     description: 'Create new conversation'
  //   })
  //   async create(@Body() data: any): Promise<Conversation[]> {
  //     data.created_by = httpContext.get('USER').email
  //     data.updated_by = ''
  //     return this.conversationService.create(data)
  //   }

  //   @Get()
  //   @ApiQuery({ name: 'page', type: Number, required: false })
  //   @ApiQuery({ name: 'pageSize', type: Number, required: false })
  //   async findAll(@Query() queryParams: any): Promise<Conversation[]> {
  //     return this.conversationService.findAll({
  //       pageSize: Number(queryParams.pageSize),
  //       page: Number(queryParams.page)
  //     })
  //   }

  @Get('groupManager')
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'pageSize', type: Number, required: false })
  async findWithGroupManager(@Query() queryParams: any): Promise<Conversation[]> {
    return this.conversationService.findByManager('group')
  }

  @Get('userManager')
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'pageSize', type: Number, required: false })
  async findWithUserManager(@Query() queryParams: any): Promise<Conversation[]> {
    return this.conversationService.findByManager('user')
  }
  //   @Get('actives')
  //   @ApiQuery({ name: 'page', type: Number, required: false })
  //   @ApiQuery({ name: 'pageSize', type: Number, required: false })
  //   async findActives(@Query() queryParams: any): Promise<Conversation[][]> {
  //     return this.conversationService.findActives(Number(queryParams.pageSize), Number(queryParams.page))
  //   }

  //   @Get('inactives')
  //   @ApiQuery({ name: 'page', type: Number, required: false })
  //   @ApiQuery({ name: 'pageSize', type: Number, required: false })
  //   async findInactives(@Query() queryParams: any): Promise<Conversation[][]> {
  //     return this.conversationService.findInactives(Number(queryParams.pageSize), Number(queryParams.page))
  //   }

  //   @Get('search')
  //   @ApiQuery({ name: 'name', type: String, required: false })
  //   async find(@Query() queryParams: any): Promise<Conversation[][]> {
  //     if (!queryParams.name)queryParams.name = ''
  //     return this.conversationService.find(queryParams)
  //   }

  //   @Get(':id')
  //   async findById(@Param('id') id: string): Promise<Conversation[]> {
  //     return this.conversationService.findById(Number(id))
  //   }

  @Put('redirectToUser')
  @ApiBody({ schema: { examples: { conversationId: 2, userId: 5 } } })
  async redirectToUser(@Body() data: any): Promise<any> {
    delete data.created_by
    data.updated_by = httpContext.get('USER').email
    return this.conversationService.updateManager(+data.conversationId, 'user', data.userId)
  }

  @Put('redirectToGroup')
  @ApiBody({ schema: { examples: { conversationId: 2, groupId: 5 } } })
  async redirectToGroup(@Body() data: any): Promise<any> {
    delete data.created_by
    data.updated_by = httpContext.get('USER').email
    return this.conversationService.updateManager(+data.conversationId, 'group', data.groupId)
  }

//   @Delete(':id')
//   async remove(@Param('id') id: string) {
//     return this.conversationService.remove(+id)
//   }
}
