import { Controller, Post, Body } from '@nestjs/common'

@Controller('twilio')
export class TwilioController {
  @Post()
  getReceivedMessageInfo (@Body() messageInfo: any): any {
    return messageInfo
  }
}
