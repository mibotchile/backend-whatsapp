import { ApiProperty } from '@nestjs/swagger'
import { Menu, Message, Quiz, Redirect, Step } from 'src/conversations/conversation.types'

export class ChannelConfigDto {
  public id: number

@ApiProperty()
  public channel_id: number

@ApiProperty({ required: true, example: '+51986958626' })
public channel_number: string

@ApiProperty({ example: ['tag 1', 'tag 2', 'tag 3'] })
public tags: string

@ApiProperty({ example: [] })
  menus: Menu[]

@ApiProperty()
  messages: Message[]

@ApiProperty()
  quizes: Quiz[]

@ApiProperty()
  redirects: Redirect[]

@ApiProperty({ required: true })
  steps: Step[]

@ApiProperty({ default: 1 })
  status: number
}
