import { Controller, Get, Post, Body, Put, Param, Delete, Query } from '@nestjs/common'
import { ChannelService } from './channel.service'
import { channel } from '@prisma/client'
import { ApiTags } from '@nestjs/swagger'

@Controller('channel')
@ApiTags('Channels')
export class ChannelController {
  constructor (private readonly channelService: ChannelService) {}
  @Post()
  async create (@Body() data: any): Promise<channel> {
    data.updated_by = ''
    return this.channelService.create(data)
  }

  @Get()
  async findAll (@Query() queryParams: any): Promise<channel[]> {
    return this.channelService.findAll({
      pageSize: Number(queryParams.pageSize),
      page: Number(queryParams.page)
    })
  }

  @Get('actives')
  async findActives (@Query() queryParams: any): Promise<channel[]> {
    return this.channelService.findActives(Number(queryParams.pageSize), Number(queryParams.page))
  }

  @Get(':id')
  async findById (@Param('id') id: string): Promise<channel> {
    return this.channelService.findById(Number(id))
  }

  @Put(':id')
  async update (@Param('id') id: string, @Body() data: any): Promise<channel> {
    delete data.created_by
    return this.channelService.update(+id, data)
  }

  @Delete(':id')
  async remove (@Param('id') id: string) {
    return this.channelService.remove(+id)
  }
}
