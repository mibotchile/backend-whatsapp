import { ApiProperty } from '@nestjs/swagger'

export class CensoredSentenceDto {
  public id: number

  @ApiProperty()
  public sentence: string

  @ApiProperty()
  public description: string

}
