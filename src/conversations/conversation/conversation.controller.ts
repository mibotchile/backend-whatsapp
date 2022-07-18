import { Controller, Get, Body, Put, Param, Query } from '@nestjs/common'
import { ConversationService } from './conversation.service'
import { ApiBody, ApiHeader, ApiResponse, ApiTags } from '@nestjs/swagger'

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

  @Get()
  @ApiResponse({ description: 'Retorna todas las conversaciones' })
  //   @ApiQuery({ name: 'page', type: Number, required: false })
  //   @ApiQuery({ name: 'pageSize', type: Number, required: false })
  async findAll(@Query() queryParams: any): Promise<Conversation[]> {
    return this.conversationService.findAll(httpContext.get('PROJECT_UID'))
  }

  @Get('groupManager')
  @ApiResponse({ description: 'Retorna las conversaciones que tienen como manager un grupo' })
  //   @ApiQuery({ name: 'page', type: Number, required: false })
  //   @ApiQuery({ name: 'pageSize', type: Number, required: false })
  async findWithGroupManager(@Query() queryParams: any): Promise<Conversation[]> {
    return this.conversationService.findByManager(httpContext.get('PROJECT_UID'), 'group')
  }

  @Get('userManager')
  @ApiResponse({ description: 'Retorna las conversaciones que tienen como manager un usuario' })
  //   @ApiQuery({ name: 'page', type: Number, required: false })
  //   @ApiQuery({ name: 'pageSize', type: Number, required: false })
  async findWithUserManager(@Query() queryParams: any): Promise<Conversation[]> {
    return this.conversationService.findByManager(httpContext.get('PROJECT_UID'), 'user')
  }

  @Get('client/:clientNumber')
  @ApiResponse({ description: 'Retorna las conversaciones de un cliente' })
  //   @ApiQuery({ name: 'page', type: Number, required: false })
  //   @ApiQuery({ name: 'pageSize', type: Number, required: false })
  async findByClientNumber(@Query() queryParams: any, @Param('clientNumber') clientNumber:string): Promise<Conversation[]> {
    return this.conversationService.findByClient(httpContext.get('PROJECT_UID'), clientNumber)
  }

  @Get('user/:userId')
  @ApiResponse({ description: 'Retorna las conversaciones de un usuario en especifico' })
  //   @ApiQuery({ name: 'page', type: Number, required: false })
  //   @ApiQuery({ name: 'pageSize', type: Number, required: false })
  async findByUserId(@Query() queryParams: any, @Param('userId') userId:string): Promise<Conversation[]> {
    return this.conversationService.findByManagerWithId(httpContext.get('PROJECT_UID'), 'user', Number(userId))
  }

  @Get('group/:groupId')
  @ApiResponse({ description: 'Retorna las conversaciones de un grupo en especifico' })
  //   @ApiQuery({ name: 'page', type: Number, required: false })
  //   @ApiQuery({ name: 'pageSize', type: Number, required: false })
  async findGroupId(@Query() queryParams: any, @Param('groupId') groupId:string): Promise<Conversation[]> {
    return this.conversationService.findByManagerWithId(httpContext.get('PROJECT_UID'), 'group', Number(groupId))
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
    return this.conversationService.updateManager(httpContext.get('PROJECT_UID'), +data.conversationId, 'user', data.userId)
  }

  @Put('redirectToGroup')
  @ApiBody({ schema: { examples: { conversationId: 2, groupId: 5 } } })
  async redirectToGroup(@Body() data: any): Promise<any> {
    delete data.created_by
    data.updated_by = httpContext.get('USER').email
    return this.conversationService.updateManager(httpContext.get('PROJECT_UID'), +data.conversationId, 'group', data.groupId)
  }

//   @Delete(':id')
//   async remove(@Param('id') id: string) {
//     return this.conversationService.remove(+id)
//   }
}
