import * as admin from 'firebase-admin'
import validator from 'validator'
import * as fs from 'fs'
import { DataSource } from 'typeorm'
import { User } from 'src/user/user.entity'
import { Role } from 'src/role/role.entity'

export class IOAuthenticationMiddleware {
  dataSource:DataSource
  constructor () {
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
    this.dataSource = new DataSource({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      entities: [User, Role],
      logging: process.env.TYPEORM_LOGS === 'true'
    })
    this.dataSource.initialize()
  }

  setSchema(schema:string) {
    this.dataSource.entityMetadatas.forEach((em, index) => {
      this.dataSource.entityMetadatas[index].schema = schema
      this.dataSource.entityMetadatas[index].tablePath = `${schema}.${em.tableName}`
    })
  }

  async use (token:string) {
    this.setSchema('project_vnblnzdm0b3bdcltpvpl')
    if (validator.isJWT(token) !== true) {
      console.log('Token invalid!')
      return { success: false, message: 'Token invalid!' }
    }
    try {
      const userInfo = await admin
        .auth()
        .verifyIdToken(token)

      const [user] = await this.dataSource.manager.getRepository(User).find({ where: { uid: userInfo.uid } })
      console.log(user)

      return { success: true, message: 'Token valid', data: user }
    } catch (error) {
      console.log(error)
      let message = 'Token validation error!'
      if (error.code === 'auth/id-token-expired') message = 'Token has expired!'
      if (error.code === 'auth/argument-error') message = 'Token invalid!'
      return { success: false, message }
    }
  }
}
