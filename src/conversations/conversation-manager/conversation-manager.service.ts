import { Injectable, Scope, Inject, forwardRef } from '@nestjs/common'
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { PointerConversation } from './pointer-conversation.entity'
import { ChannelConfig } from 'src/channel/channel_config.entity'
import * as twilio from 'twilio'
import { Config, Message, Menu, Option, Question, Quiz, Redirect } from '../conversation.types'
import { ResponseValidatorRepository } from '../response-validator/response-validator.repository'
import { MessageGateway } from '../messages-gateway/message.gateway'

@Injectable({ scope: Scope.REQUEST })
export class ConversationManagerService {
  constructor(
    @Inject(forwardRef(() => MessageGateway)) private readonly messageWs: MessageGateway,
        @InjectDataSource('default') private dataSource: DataSource,
        @InjectRepository(PointerConversation) private pointerRepo: Repository<PointerConversation>,
        @InjectRepository(ChannelConfig) private channelConfigRepo: Repository<ChannelConfig>
  ) {
    this.setSchema('project_vnblnzdm0b3bdcltpvpl')
  }

  setSchema(schema:string) {
    this.dataSource.entityMetadatas.forEach((em, index) => {
      this.dataSource.entityMetadatas[index].schema = schema // httpContext.get('PROJECT_UID').toLowerCase()
      this.dataSource.entityMetadatas[index].tablePath = `${schema}.${em.tableName}`
    })
  }

  async sendMessage(message: string, waId: string) {
    const twilioClient = twilio(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN)

    await twilioClient.messages.create({
      from: 'whatsapp:+14155238886',
      body: message,
      to: `whatsapp:+${waId}`
    })
    this.messageWs.sendMessageReceived({ Body: message })
  }

  async messageClietHandler(message: string, waId: string, channel_number: string) {
    // console.log('Handler')
    // console.log(JSON.stringify(config, null, '\t'))
    const pointerDB = await this.findPointerByWaId(waId)
    let subpointers = pointerDB ? pointerDB.pointer.split('>') : ['step.1']
    let config
    if (!pointerDB) {
      config = await this.findConfigByChannelNumber('+19206787641')
      subpointers = ['step.1']
    } else {
      config = pointerDB.config
    }

    let stepOrder = Number(subpointers[0].replace('step.', ''))

    if (!this.existStep(stepOrder, config)) {
      this.deletePointer(waId)
      await this.createPointer(waId, 'step.1', config)
      subpointers = ['step.1']
      stepOrder = 1
    }

    const responseTo: string = subpointers[subpointers.length - 1]
    console.log({ responseTo })

    let action: string
    let quiz: Quiz
    let newPointer: string

    if (responseTo.includes('menu')) {
      const menuId = responseTo.split('.')[1]
      const menu = this.findMenuById(Number(menuId), config)
      if (!this.isValidOption(message, menu)) {
        this.sendMessage('Por favor elija una opcion valida', waId)
        return
      }
      const optionSelected = this.findOptionFromMenu(Number(message), menu)
      action = optionSelected.action
    }

    if (responseTo.includes('question')) {
      quiz = this.findQuizById(Number(subpointers[subpointers.length - 2].split('.')[1]), config)
      const questionId = Number(responseTo.split('.')[1])
      const question = this.findQuestionFromQuiz(questionId, quiz)
      if (!this.isValidQuestionResponse(question, message)) {
        this.sendMessage(question.error_message, waId)
        return
      }
      if (this.existQuestionInQuiz(questionId + 1, quiz)) {
        action = `question.${questionId + 1}`
        subpointers.pop()
        subpointers.push(action)
        newPointer = subpointers.join('>')
      } else {
        // console.log('question else')
        stepOrder += 1
        const step = this.findStepById(stepOrder, config)
        action = step.action
      }
    }

    if (responseTo.includes('step')) {
      const step = this.findStepById(stepOrder, config)
      action = step.action

      if (step.action.includes('quiz')) {
        const quizId = Number(step.action.split('.')[1])
        quiz = this.findQuizById(quizId, config)
        const question = quiz.questions[0]
        action = `question.${question.id}`
        newPointer = `step.${stepOrder}>${step.action}>question.${question.id}`
      }
    }
    console.log({ action })

    let messageToSend: string

    if (action.includes('message')) {
      messageToSend = this.builResponseByAction(action, { config })
      console.log({ messageToSend })

      await this.sendMessage(messageToSend, waId)
      newPointer = `step.${stepOrder + 1}`
      if (stepOrder === 1) {
        await this.createPointer(waId, newPointer, config)
      } else {
        await this.updatePointer(waId, newPointer)
      }
      if (!this.existStep(stepOrder + 1, config)) {
        action = 'close'
      } else {
        await this.messageClietHandler(message, waId, channel_number)
        return
      }
    }

    if (action.includes('menu')) {
      console.log('lengthhhhhhhh-> ', subpointers.length)
      if (subpointers.length === 1) subpointers[0] = `step.${stepOrder + 1}` // esto sucede cuando el step contiene como action un menu
      if (subpointers.length === 2) subpointers.pop() // esto sucede cuando la opcion escogida continen com action otro menu
      subpointers.push(action)
      newPointer = subpointers.join('>')
      if (responseTo.includes('question')) {
        // esto sucede cuando se termina un quiz (osea el quiestio id es el ultimo) y el siguiente paso tiene como action un menu
        newPointer = `step.${stepOrder + 1}>${action}`
      }
    }

    if (action.includes('redirect')) {
      messageToSend = 'En breve un asesor se comunicara con usted'
      newPointer = `step.${stepOrder + 1}`
    } else {
      messageToSend = this.builResponseByAction(action, { config, quiz })
    }

    if (action.includes('close')) {
      messageToSend = 'Gracias por comunicarse con nosotros'
      this.deletePointer(waId)
    } else {
      if (stepOrder === 1) {
        await this.createPointer(waId, newPointer, config)
      } else {
        await this.updatePointer(waId, newPointer)
      }
    }
    console.log({ action })
    console.log({ messageToSend })

    await this.sendMessage(messageToSend, waId)
    console.log({ stepOrder })
  }

  async updatePointer(waId: string, newPointer: string) {
    await this.pointerRepo.update({ phone_number: waId }, { pointer: newPointer })
  }

  //   async redirectClient(waId:string, redirect:Redirect) {
  //     await this.pointerRepo.update({ phone_number: waId }, { pointer: newPointer })
  //   }

  isValidOption(optionSelected:string, menu:Menu) {
    const optionId = Number(optionSelected.trim())
    if (isNaN(optionId)) return false
    return menu.options.some(o => o.id === optionId)
  }

  isValidQuestionResponse(question:Question, response:string) {
    const validator = ResponseValidatorRepository.findById(Number(question.response_type))
    if (!validator) {
      return true
    }
    const regex = new RegExp(validator.regex)
    return regex.test(response)
  }

  async createPointer(waId: string, newPointer: string, config:Config) {
    await this.pointerRepo.insert({ phone_number: waId, pointer: newPointer, config })
  }

  async deletePointer(waId: string) {
    await this.pointerRepo.update({ phone_number: waId }, { status: 0 })
  }

  async findConfigByChannelNumber(phoneNumber: string): Promise<Config> {
    const configs = await this.channelConfigRepo.find({ where: { channel_number: phoneNumber } })
    return configs[0]
    // return {
    //   id: 1,
    //   menus: [
    //     {
    //       id: 1,
    //       title: 'titulo del menu 1',
    //       options: [
    //         {
    //           id: 1,
    //           value: 'opcion 1',
    //           action: 'message.2'
    //         },
    //         {
    //           id: 2,
    //           value: 'opcion 2',
    //           action: 'message.3'
    //         },
    //         {
    //           id: 3,
    //           value: 'mostrar otro menu',
    //           action: 'menu.2'
    //         },
    //         {
    //           id: 4,
    //           value: 'opcion 4',
    //           action: 'message.1'
    //         }
    //       ]
    //     },
    //     {
    //       id: 2,
    //       title: 'titulo del menu de la opcion 3',
    //       options: [
    //         {
    //           id: 1,
    //           value: 'opcion 1 del menu 2',
    //           action: 'message.2'
    //         },
    //         {
    //           id: 2,
    //           value: 'opcion 2 del menu 2',
    //           action: 'message.3'
    //         },
    //         {
    //           id: 3,
    //           value: 'opcion 3 del menu 2',
    //           action: 'message.5'
    //         },
    //         {
    //           id: 4,
    //           value: 'opcion 4 del menu 2',
    //           action: 'redirect.1'
    //         }
    //       ]
    //     }
    //   ],
    //   messages: [
    //     {
    //       id: 1,
    //       message: 'gracias por escoger la opcion 4'
    //     },
    //     {
    //       id: 2,
    //       message: 'opcion 1 seleccionada'
    //     },
    //     {
    //       id: 3,
    //       message: 'escogi la opcion 2'
    //     },
    //     {
    //       id: 4,
    //       message: 'Bienvenido '
    //     },
    //     {
    //       id: 5,
    //       message: 'hola gracias por escoger la opcion 3'
    //     }
    //   ],
    //   quizes: [
    //     {
    //       id: 1,
    //       questions: [
    //         {
    //           id: 1,
    //           question: '¿Cual es tu email?',
    //           response_type: 1, // "string|email|url|phone_number|dni|date",
    //           error_message: 'por favor se escrba un email valido'
    //         },
    //         {
    //           id: 2,
    //           question: '¿Cual es tu numero de celualar?',
    //           response_type: 4, // "string|email|url|phone_number|dni|date",
    //           error_message: 'por favor se escriba un numero de celular valido'
    //         }
    //       ]
    //     }
    //   ],
    //   redirects: [
    //     {
    //       id: 1,
    //       to: 'grupo.5'
    //     },
    //     {
    //       id: 2,
    //       to: 'whatsapp+51956326148'
    //     }
    //   ],
    //   steps: [
    //     {
    //       order: 1,
    //       action: 'message.4',
    //       status: 1
    //     },
    //     {
    //       order: 2,
    //       action: 'quiz.1',
    //       status: 1
    //     },
    //     {
    //       order: 3,
    //       action: 'menu.1',
    //       status: 1
    //     },
    //     {
    //       order: 4,
    //       action: 'close',
    //       status: 1
    //     }
    //   ]
    // }
  }

  async findPointerByWaId(waId: string): Promise<PointerConversation> {
    const pointers = await this.pointerRepo.find({ where: { phone_number: waId, status: 1 } })
    return pointers[0]
    // return 'step2>menu1>option3>menu2'
    // return 'step3>quiz2>question5'
  }

  existQuestionInQuiz(questionId: number, quiz: Quiz) {
    return quiz.questions.some((q) => q.id === questionId)
  }

  existStep(stepOrder: number, config: Config) {
    return config.steps.some((s) => s.step === stepOrder)
  }

  findQuestionFromQuiz(questionId: number, quiz: Quiz): Question {
    return quiz.questions.find((q) => q.id === questionId)
  }

  findFirstQuestionFromQuiz(quiz: Quiz): Question {
    return quiz.questions[0]
  }

  findQuizById(quizId: number, config: Config): Quiz {
    return config.quizes.find((q) => q.id === quizId)
  }

  findStepById(stepOrder: number, config: Config) {
    return config.steps.find((s) => s.step === stepOrder)
  }

  findMenuById(menuId: number, config: Config): Menu {
    return config.menus.find((m) => m.id === menuId)
  }

  findOptionFromMenu(optionId: number, menu: Menu): Option {
    return menu.options.find((o) => o.id === optionId)
  }

  findMessageById(messageId: number, config: Config): Message {
    return config.messages.find((m) => m.id === messageId)
  }

  findRedirectById(redirectId: number, config: Config): Redirect {
    return config.redirects.find((r) => r.id === redirectId)
  }

  builResponseByAction(action: string, { config, quiz }: { config?: Config; quiz?: Quiz }): string {
    const [itemType, itemId] = action.split('.')
    let messageResponse = ''
    switch (itemType) {
      case 'menu':
        const menu = this.findMenuById(Number(itemId), config)
        const options = menu.options.map((o) => `*${o.id}.* ${o.value}`)
        messageResponse = `*${menu.title}*\n\n${options.join('\n')}`
        break
      case 'question':
        const question = this.findQuestionFromQuiz(Number(itemId), quiz)
        messageResponse = question.question
        break
      case 'quiz':
        const question1 = quiz.questions[0]
        messageResponse = question1.question
        break
      case 'message':
        const message = this.findMessageById(Number(itemId), config)
        messageResponse = message.message
        break
    }
    return messageResponse
  }
}
