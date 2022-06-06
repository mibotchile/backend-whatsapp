import { ApiProperty } from '@nestjs/swagger'

export class GroupDto {
  public id: number

  @ApiProperty()
  public name: string

  @ApiProperty()
  public description: string

  @ApiProperty({ example: ['tag 1', 'tag 2', 'tag 3'] })
  public tags: string
}
