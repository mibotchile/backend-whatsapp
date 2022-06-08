import { CanActivate, ExecutionContext, Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { Request } from 'express'
import { Observable } from 'rxjs'

@Injectable()
export class RolesGuard implements CanActivate {
  private getPermissions(roleConfig, routeName): string[] {
    let permissions = []
    for (const rc of roleConfig) {
      if (rc.name === routeName) {
        permissions = rc.hasPermissions ? rc.permissions : []
        break
      }
      if (rc.hasTabs) {
        for (const tab of rc.tabs) {
          if (tab.name === routeName) {
            permissions = tab.hasPermissions ? tab.permissions : []
            return permissions
          }
        }
      }
      if (rc.hasChildren) {
        return this.getPermissions(rc.children, routeName)
      }
    }
    return permissions
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest()
    const role = {
      config: [
        {
          name: 'configuraciones',
          hasChildren: false,
          children: [],
          hasTabs: true,
          tabs: [
            {
              name: 'user',
              hasPermissions: true,
              permissions: ['create', 'read', 'update']
            },
            {
              name: 'group',
              hasPermissions: true,
              permissions: ['create', 'update', 'delete']
            },
            {
              name: 'channel',
              hasPermissions: true,
              permissions: ['create', 'read']
            }
          ],
          hasPermissions: false,
          permissions: []
        },
        {
          name: 'conversation',
          hasChildren: true,
          children: [
            {
              name: 'conversaciones',
              hasChildren: false,
              children: [],
              hasTabs: true,
              tabs: [
                {
                  name: 'role',
                  hasPermissions: true,
                  permissions: ['read', 'create', 'update']
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
    }
    // const user = request.user
    const routeName = request.route.path.split('/')[1]
    const permissions = this.getPermissions(role.config, routeName)
    console.log(permissions)

    let permissionRequired
    switch (request.method) {
      case 'GET':
        permissionRequired = 'read'
        break
      case 'POST':
        permissionRequired = 'create'
        break
      case 'PUT':
        permissionRequired = 'update'
        break
      case 'DELETE':
        permissionRequired = 'delete'
        break
    }

    if (!permissions.includes(permissionRequired)) {
      throw new HttpException(
        {
          error: 'HttpStatus.FORBIDDEN',
          success: false,
          message: 'No tiene los permisos para realizar esta accion'
        },
        HttpStatus.FORBIDDEN
      )
    }
    return true
  }
}
