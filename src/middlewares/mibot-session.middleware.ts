import { Injectable, NestMiddleware } from '@nestjs/common'
import * as httpContext from 'express-http-context'

@Injectable()
export class MibotSessionMiddleware implements NestMiddleware {
  use (req: any, res: any, next: () => void) {
    if (!req.headers.mibot_session) {
      res.status(401).json({
        message: 'No existe el header mibot_session',
        error: 'Bad Request'
      })
      return
    }

    let mibotSession
    try {
      mibotSession = JSON.parse(req.headers.mibot_session)
    } catch (error) {
      res.status(401).json({
        message: 'El header mibot_session deve ser de tipo JSON e incluir project_uid y client_uid',
        error: 'Bad Request'
      })
      return
    }
    // const now = new Intl.DateTimeFormat('af-ZA', { year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: 'numeric', second: 'numeric', timeZone: 'UTC' }).format(Date.now())
    const now = new Date().toISOString()
    if (req.body) {
      switch (req.method) {
        case 'POST':
          req.body.created_at = now
          req.body.updated_at = now
          break
        case 'PUT':
          req.body.updated_at = now
          break
      }
    }

    res.locals.PROJECT_UID = mibotSession.project_uid
    res.locals.CLIENT_UID = mibotSession.client_uid
    httpContext.set('PROJECT_UID', mibotSession.project_uid)
    console.log(httpContext.get('PROJECT_UID'))

    httpContext.set('CLIENT_UID', mibotSession.client_uid)
    next()
  }
}
