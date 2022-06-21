import { Controller, Get } from '@nestjs/common'
import { ApiHeader, ApiTags } from '@nestjs/swagger'
import { ChannelService } from './channel.service'

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
}
