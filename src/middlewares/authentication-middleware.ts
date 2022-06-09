import * as admin from 'firebase-admin'
import validator from 'validator'
import * as fs from 'fs'
import { ForbiddenException, Injectable, NestMiddleware } from '@nestjs/common'
import * as httpContext from 'express-http-context'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class AuthenticationMiddleware implements NestMiddleware {
  constructor (private readonly prisma:PrismaClient) {
    if (admin.apps.length === 0) {
      const credentialsCert = JSON.parse(
        fs.readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, {
          encoding: 'utf-8'
        })
      )
      admin.initializeApp({
        credential: admin.credential.cert(credentialsCert)
      })
    }
  }

  async use (req: any, res: any, next: () => void) {
    if (!req.headers.authorization) {
      if (req.originalUrl.startsWith('/v1/external/')) {
        next()
        return
      } else {
        console.log('**Auth token not found**')
        throw new ForbiddenException(
          {
            data: [],
            success: false,
            message: 'Auth token not found'
          }
        )
      }
    }

    const token = req.headers.authorization.split(' ')[1]
    // console.log('Token:', token);

    if (validator.isJWT(token) !== true) {
      console.log('Token invalid!')
      return res.status(401).send({ success: false, msg: 'Token invalid!' })
    }
    res.locals.token = token
    try {
      const userInfo = await admin
        .auth()
        .verifyIdToken(token)

      res.locals.user = userInfo
      httpContext.set('USER', userInfo.email)

      const users = await this.prisma.user.findMany({ where: { email: userInfo.email }, include: { role: true } })

      // console.log({ users })

      if (users.length === 0) {
        res.status(406).json(
          {
            data: [],
            success: false,
            message: 'Este usuario no esta registrado en este servicio'
          }
        )
        // throw new HttpException(
        //   {
        //     data: [],
        //     success: false,
        //     message: 'this user does not have permission to enter'
        //   },
        //   HttpStatus.NOT_ACCEPTABLE
        // )
      } else {
        httpContext.set('ROLE', users[0].role)
        next()
      }
      // if(decodedToken.email)
    } catch (error) {
      console.log(error)

      if (error.code === 'auth/id-token-expired') {
        console.log('Token has expired!')
        return res
          .status(403)
          .json({ success: false, message: 'Token has expired!' })
      }
      if (error.code === 'auth/argument-error') {
        console.log('Token invalid!')
        return res
          .status(401)
          .json({ success: false, message: 'Token invalid!' })
      }
      return res
        .status(500)
        .json({ success: false, message: 'Token validation error!' })
    }
  }
}
