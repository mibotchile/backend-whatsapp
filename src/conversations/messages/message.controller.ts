import { Controller, Get, Query, Param } from '@nestjs/common'
import { MessageService } from './message.service'
import { ApiHeader, ApiQuery, ApiTags } from '@nestjs/swagger'

import { Message } from './message.entity'

@Controller('message')
@ApiTags('Messages')
@ApiHeader({ name: 'mibot_session', required: true })
@ApiHeader({
  name: 'Authorization',
  required: true,
  example: 'beareer slkjdjklskdlfkj'
})
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  //   @Post()
  //   @ApiBody({
  //     type: Message,
  //     description: 'Create new message'
  //   })
  //   async create(@Body() data: any): Promise<Message[]> {
  //     data.created_by = httpContext.get('USER').email
  //     data.updated_by = ''
  //     return this.messageService.create(data)
  //   }

  //   @Get()
  //   @ApiQuery({ name: 'page', type: Number, required: false })
  //   @ApiQuery({ name: 'pageSize', type: Number, required: false })
  //   async findAll(@Query() queryParams: any): Promise<Message[]> {
  //     return this.messageService.findAll({
  //       pageSize: Number(queryParams.pageSize),
  //       page: Number(queryParams.page)
  //     })
  //   }

  @Get('conversation/:conversationId')
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'pageSize', type: Number, required: false })
  async findWithGroupManager(@Param('conversationId') conversationId:string, @Query() queryParams: any): Promise<Message[]> {
    return this.messageService.findByConversationId(Number(conversationId))
  }

  //   @Get('client/:clientNumber')
  //   @ApiQuery({ name: 'page', type: Number, required: false })
  //   @ApiQuery({ name: 'pageSize', type: Number, required: false })
  //   async findWithUserManager(@Param('clientNumber') clientNumber:string, @Query() queryParams: any): Promise<Message[]> {
  //     return this.messageService.findByClientNumber(clientNumber)
  //   }
  // ------------------

  //   @Get('actives')
  //   @ApiQuery({ name: 'page', type: Number, required: false })
  //   @ApiQuery({ name: 'pageSize', type: Number, required: false })
  //   async findActives(@Query() queryParams: any): Promise<Message[][]> {
  //     return this.messageService.findActives(Number(queryParams.pageSize), Number(queryParams.page))
  //   }

  //   @Get('inactives')
  //   @ApiQuery({ name: 'page', type: Number, required: false })
  //   @ApiQuery({ name: 'pageSize', type: Number, required: false })
  //   async findInactives(@Query() queryParams: any): Promise<Message[][]> {
  //     return this.messageService.findInactives(Number(queryParams.pageSize), Number(queryParams.page))
  //   }

  //   @Get('search')
  //   @ApiQuery({ name: 'name', type: String, required: false })
  //   async find(@Query() queryParams: any): Promise<Message[][]> {
  //     if (!queryParams.name)queryParams.name = ''
  //     return this.messageService.find(queryParams)
  //   }

  //   @Get(':id')
  //   async findById(@Param('id') id: string): Promise<Message[]> {
  //     return this.messageService.findById(Number(id))
  //   }

//   @Delete(':id')
//   async remove(@Param('id') id: string) {
//     return this.messageService.remove(+id)
//   }
}
