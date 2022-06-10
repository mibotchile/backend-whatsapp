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

export class UserResponse {
  @ApiProperty({
    example: [{
      id: 10,
      name: 'grupo 70',
      description: 'test',
      tags: [
        'update1',
        'update2'
      ],
      default: false,
      created_by: 'Tester',
      updated_by: '',
      created_at: '2022-05-23T21:21:43.304Z',
      updated_at: '2022-05-24T17:04:33.037Z',
      status: 1
    },
    {
      id: 11,
      name: 'grupo 11',
      description: 'test',
      tags: [
        'update1',
        'update2',
        'update3'
      ],
      default: false,
      created_by: 'Tester',
      updated_by: '',
      created_at: '2022-05-23T21:29:31.773Z',
      updated_at: '2022-05-26T17:32:22.405Z',
      status: 1
    }]
  })
  public data: Array<any>

  @ApiProperty()
  public success: boolean

  @ApiProperty()
  public message: string
}
