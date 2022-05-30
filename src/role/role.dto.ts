import { ApiProperty } from '@nestjs/swagger'

// class Tab {
//   @ApiProperty()
//   public name: string

//   @ApiProperty()
//   public hasPermissions: boolean

//   @ApiProperty()
//   public permissions: string[]
// }

// class RoleConfig {
//   @ApiProperty()
//   public name: string

//   @ApiProperty({
//     example: {
//       name: 'configuraciones',
//       childrens: [],
//       tabs: [],
//       hasPermissions: true,
//       permissions: ['read', 'create']
//     }
//   })
//   public children: Array<this>

//   @ApiProperty()
//   public hasPermissions: boolean

//   @ApiProperty({ example: ['read', 'create'] })
//   public permissions: string[]

//   @ApiProperty({ type: Tab })
//   public tabs: Tab[]
// }

export class RoleDto {
  public id: number

  @ApiProperty({ example: 'Supervisor' })
  public name: string

  @ApiProperty({ example: 'write a description' })
  public description: string

  @ApiProperty({
    example: [
      {
        name: 'configuraciones',
        hasChildren: false,
        children: [],
        hasTabs: true,
        tabs: [
          {
            name: 'usuarios',
            hasPermissions: true,
            permissions: ['create', 'read', 'update']
          },
          {
            name: 'grupos',
            hasPermissions: true,
            permissions: ['read']
          },
          {
            name: 'canales',
            hasPermissions: true,
            permissions: ['create', 'read']
          }
        ],
        hasPermissions: false,
        permissions: []
      },
      {
        name: 'conversaciones',
        hasChildren: true,
        children: [
          {
            name: 'conversaciones',
            hasChildren: false,
            children: [],
            hasTabs: true,
            tabs: [
              {
                name: 'grupos',
                hasPermissions: true,
                permissions: ['read']
              }
            ],
            hasPermissions: true,
            permissions: ['create', 'read', 'update', 'delete']
          }
        ],
        hasTabs: false,
        tabs: [],
        hasPermissions: true,
        permissions: ['create', 'read', 'update', 'delete']
      }
    ]
  })
  public config: JSON
}
