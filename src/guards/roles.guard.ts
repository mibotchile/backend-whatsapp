import { CanActivate, ExecutionContext, Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { Request } from 'express'
import { Observable } from 'rxjs'
import * as httpContext from 'express-http-context'

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
    // console.log(request.route)
    // console.log(request.params)

    const routePath = request.route.path.split('/')
    if (routePath[1] === 'status') return true
    if (routePath[1] === 'message') return true
    if (routePath[1] === 'conversation') return true
    if (routePath[1] === 'responseValidator') return true
    if (routePath[1] === 'health') return true
    if (routePath[1] === 'project') return true
    if (routePath[1] === 'socket.io') return true
    if (routePath[1] === 'user' && routePath[2] === 'uid') {
      if (request.params.uid === httpContext.get('USER').uid) {
        return true
      }
    }

    const role = httpContext.get('ROLE')
    const permissions = this.getPermissions(role.config, routePath[1])
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
          message: `No tiene permisos para ${action} ${routePath[1]} `
        },
        HttpStatus.FORBIDDEN
      )
    }
    return true
  }
}
