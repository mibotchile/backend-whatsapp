import { ApiProperty } from '@nestjs/swagger'

export class RoleDto {
  public id: number

  @ApiProperty()
  public name: string

  @ApiProperty()
  public description: string

  @ApiProperty({ example: { conversaciones: 'all', configuracion: { canales: ['#id', '.class'] } } })
  public fronted: JSON

  @ApiProperty({ example: { conversaciones: 'all', configuracion: { canales: ['#id', '.class'] } } })
  public backend: JSON
}
