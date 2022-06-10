import { CanActivate, ExecutionContext, Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { Request } from 'express'
import { Observable } from 'rxjs'
import { PrismaClient } from '@prisma/client'
import * as httpContext from 'express-http-context'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor (private readonly prisma:PrismaClient) {}

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
    const role = httpContext.get('ROLE')
    const routeName = request.route.path.split('/')[1]
    const permissions = this.getPermissions(role.config, routeName)
    // console.log(permissions)

    let permissionRequired
    let action
    switch (request.method) {
      case 'GET':
        permissionRequired = 'read'
        action = 'leer'
        break
      case 'POST':
        permissionRequired = 'create'
        action = 'crear'
        break
      case 'PUT':
        permissionRequired = 'update'
        action = 'actualizar'
        break
      case 'DELETE':
        permissionRequired = 'delete'
        action = 'desactivar'
        break
    }

    if (!permissions.includes(permissionRequired)) {
      throw new HttpException(
        {
          error: 'HttpStatus.FORBIDDEN',
          success: false,
          message: `No tiene permisos para ${action} ${routeName} `
        },
        HttpStatus.FORBIDDEN
      )
    }
    return true
  }
}
