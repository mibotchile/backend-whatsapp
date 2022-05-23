import * as admin from 'firebase-admin'
import validator from 'validator'
import * as fs from 'fs'
import { Injectable, NestMiddleware } from '@nestjs/common'

@Injectable()
export class AuthenticationMiddleware implements NestMiddleware {
  constructor () {
    console.log('se inició')

    const credentialsCert = JSON.parse(fs.readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, { encoding: 'utf-8' }))
    admin.initializeApp({
      credential: admin.credential.cert(credentialsCert),
      databaseURL: process.env.FIREBASE_DATABASE_URL
    })
  }

  use (req: any, res: any, next: () => void) {
    if (!req.headers.authorization) {
      if (req.originalUrl.startsWith('/v1/external/')) {
        next()
        return
      } else {
        console.log('**Auth token not found**')
        return res.status(403).send({ success: false, msg: 'Auth token not found' })
      }
    }

    const token = req.headers.authorization.split(' ')[1]
    // console.log('Token:', token);

    if (validator.isJWT(token) !== true) {
      console.log('Token invalid! jus')
      return res.status(401).send({ success: false, msg: 'Token invalid!' })
    }
    res.locals.token = token

    admin
      .auth()
      .verifyIdToken(token)
      .then((decodedToken) => {
        // console.log(decodedToken);
        // req.userUI = decodedToken.uid;
        // console.log('Token Valid | ' + req.method + ' | ', req.path);

        res.locals.user = decodedToken
        next()
      })
      .catch((error) => {
        if (error.code === 'auth/id-token-expired') {
          console.log('Token has expired!')
          return res.status(403).json({ success: false, msg: 'Token has expired!' })
        }
        if (error.code === 'auth/argument-error') {
          console.log('Token invalid sdf!')
          return res.status(401).json({ success: false, msg: 'Token invalid!' })
        }
        return res.status(500).json({ success: false, msg: 'Token validation error!' })
      })
  }
}
