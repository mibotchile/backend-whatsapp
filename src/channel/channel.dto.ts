import { ApiProperty } from '@nestjs/swagger'

export class ChannelDto {
  public id: number

  @ApiProperty()
  public phone_number: string

  @ApiProperty()
  public name: string

  @ApiProperty({ default: 1 })
  public status: number
}
