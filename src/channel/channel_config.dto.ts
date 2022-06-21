import { ApiProperty } from '@nestjs/swagger'
import { AnyRecord } from 'dns'

export class ChannelConfigDto {
  public id: number

@ApiProperty()
  public channel_id: number

@ApiProperty({ required: true, example: '+51986958626' })
public channel_number: string

@ApiProperty({ example: ['tag 1', 'tag 2', 'tag 3'] })
public tags: string

@ApiProperty({ example: [] })
  menus: AnyRecord[]

@ApiProperty()
  messages: string[]

@ApiProperty()
  quizes: string[]

@ApiProperty()
  questions: string[]

@ApiProperty({ required: true })
  steps: string[]

@ApiProperty({ default: 1 })
  status: number
}
