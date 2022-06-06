import { ApiProperty } from '@nestjs/swagger'

export class UserDto {
  public id: number

  @ApiProperty()
  public name: string

  @ApiProperty()
  public uid: string

  @ApiProperty()
  public email: string

  @ApiProperty({ example: [1, 3, 4] })
  public groups_id: Array<number>

  @ApiProperty()
  public role_id: number
}
