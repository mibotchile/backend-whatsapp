import { Controller, Get, Post, Body, Param, Put } from '@nestjs/common'
import { ApiBody, ApiHeader, ApiTags } from '@nestjs/swagger'
import { ChannelService } from './channel.service'
import { ChannelConfig } from './channel-config/channel_config.entity'
import * as httpContext from 'express-http-context'
import { Channel } from 'amqp-connection-manager'
import { ChannelDto } from './channel.dto'
import { ChannelConfigDto } from './channel-config/channel_config.dto'

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

  @Post('config')
  @ApiBody({ type: ChannelConfigDto })
  async createConfig(@Body() data: ChannelConfig): Promise<any> {
    data.created_by = httpContext.get('USER').email
    data.updated_by = ''
    return this.channelService.createConfig(data)
  }

  @Put('config/:phoneNumber')
  @ApiBody({ type: ChannelConfigDto })
  async updateConfig(@Param('phoneNumber') phoneNumber: string, @Body() data: ChannelConfig): Promise<any> {
    delete data.created_by
    data.updated_by = httpContext.get('USER').email
    return this.channelService.updateConfig(phoneNumber, data)
  }

  @Post()
  @ApiBody({ type: ChannelDto })
  async create(@Body() data: Channel): Promise<any> {
    console.log(data)

    data.created_by = httpContext.get('USER').email
    data.updated_by = ''
    return this.channelService.create(data)
  }

  @Put(':id')
  @ApiBody({ type: ChannelDto })
  async update(@Param('id') id: string, @Body() data: Channel): Promise<any> {
    console.log(data)
    data.created_by = httpContext.get('USER').email
    data.updated_by = ''
    return this.channelService.update(Number(id), data)
  }

  @Get('config/number/:number')// cambio
  async findByNumber(@Param('number') number: string): Promise<any> {
    return this.channelService.findConfigByPhoneNumber(number)
  }

  @Get('prettyConfig/number/:number')// cambio
  async findPrettyByNumber(@Param('number') number: string): Promise<any> {
    const config = await this.channelService.findConfigByPhoneNumber(number)
    config.data = this.channelService.prettierConfig(config.data)
    return config
  }
}
