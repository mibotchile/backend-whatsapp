import { Injectable, NestMiddleware } from '@nestjs/common'
import * as httpContext from 'express-http-context'

@Injectable()
export class MibotSessionMiddleware implements NestMiddleware {
  use (req: any, res: any, next: () => void) {
    if (!req.headers.mibot_session) {
      res.status(401).json({
        message: 'missing mibot_session headers',
        error: 'Bad Request'
      })
      return
    }
    const mibotSession = JSON.parse(req.headers.mibot_session)

    res.locals.PROJECT_UID = mibotSession.project_uid
    res.locals.CLIENT_UID = mibotSession.client_uid
    httpContext.set('PROJECT_UID', mibotSession.project_uid)
    httpContext.set('CLIENT_UID', mibotSession.client_uid)
    next()
  }
}
