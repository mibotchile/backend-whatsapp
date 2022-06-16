import { ConsoleLogger, Injectable } from '@nestjs/common'
import * as fs from 'node:fs'

@Injectable()
export class FileLoggerService extends ConsoleLogger {
  error(message: any, stack?: string, context?: string) {
    const date = new Date()
    const logDirectory = 'logs/' + new Intl.DateTimeFormat('fr-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(Date.now()).replaceAll('-', '/')
    // console.log('looooooogg', logDirectory)
    if (!fs.existsSync(logDirectory)) {
      fs.mkdirSync(logDirectory, { recursive: true })
    }
    const logName = (new Intl.DateTimeFormat('es', { timeStyle: 'medium' }).format(date)).replaceAll(':', '_')
    console.log('looooooogg name', logName)
    fs.writeFileSync(logDirectory + '/' + logName + '_error.log', message + '\n' + stack + '\n' + context)
    super.error(message, stack, context)
  }

  /**
   * Write a 'warn' level log.
   */
  warn(message: any, stack?: string, context?: string) {
    const date = new Date()
    const logDirectory = 'logs/' + new Intl.DateTimeFormat('fr-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(Date.now()).replaceAll('-', '/')
    // console.log('looooooogg', logDirectory)
    if (!fs.existsSync(logDirectory)) {
      fs.mkdirSync(logDirectory, { recursive: true })
    }
    const logName = (new Intl.DateTimeFormat('es', { timeStyle: 'medium' }).format(date)).replaceAll(':', '_')
    console.log('looooooogg name', logName)
    fs.writeFileSync(logDirectory + '/' + logName + '_warn.log', message + '\n' + stack + '\n' + context)
    super.error(message, stack, context)
  }
}
