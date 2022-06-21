import { Controller, Get, Post, Body, Param } from '@nestjs/common'
import { ApiHeader, ApiTags } from '@nestjs/swagger'
import { ChannelService } from './channel.service'
import { ChannelConfig } from './channel_config.entity'
import * as httpContext from 'express-http-context'
import { Channel } from 'amqp-connection-manager'

@Controller('channel')
@ApiTags('Channels')
@ApiHeader({ name: 'mibot_session', required: true })
@ApiHeader({
  name: 'Authorization',
  required: true,
  example: 'bearer s4lkjds54g5554sfd65sd56f654df65sd4f5we5454a654j564kjk89hgg3s545kdlfkj'
})
export class ChannelController {
  constructor(private channelService:ChannelService) {}

  @Get()
  async findAll(): Promise<any> {
    return this.channelService.findNumbers()
  }

  @Post('createConfig')
  async createConfig(@Body() data: ChannelConfig): Promise<any> {
    data.created_by = httpContext.get('USER').email
    data.updated_by = ''
    return this.channelService.createConfig(data)
  }

  @Post()
  async create(@Body() data: Channel): Promise<any> {
    console.log(data)

    data.created_by = httpContext.get('USER').email
    data.updated_by = ''
    return this.channelService.create(data)
  }

  @Get('phoneNumber/:number')
  async findByNumber(@Param('number') number: string): Promise<any> {
    return this.channelService.findConfigByPhoneNumber(number)
  }
}
