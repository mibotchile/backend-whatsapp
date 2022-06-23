import { HttpException, HttpStatus, Injectable, Scope } from '@nestjs/common'
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import { DataSource, ILike, In, Not, Repository } from 'typeorm'
import * as httpContext from 'express-http-context'
import { PointerConversation } from './pointer-conversation.entity'
import { ChannelConfig } from 'src/channel/channel_config.entity'
import * as twilio from 'twilio'

interface Option{
    id:number,
    value:string,
    action:string
}

interface Menu{
    id:number,
    title:string,
    options:Option[]
}

interface Message{
    id:number,
    message:string
}
interface Question{
    id:number,
    question:string,
    response_type:'string'|'email'|'url'|'phone_number'|'dni'|'date',
    error_message:string
}
interface Quiz{
    id:number,
    questions:Question[]
}

interface Step{
   // id:number,
    order:number,
    action:string
    status:number|boolean,

}

interface Redirect{
   // id:number,
   id:number,
    to:string

}

interface Config{
    id:number,
    menus:Menu[],
    quizes:Quiz[],
    messages:Message[],
    steps:Step[],
    redirects:Redirect[]

}

@Injectable({ scope: Scope.REQUEST })
export class ConversationManagerService {
  constructor (@InjectDataSource('default')
    private dataSource: DataSource, @InjectRepository(PointerConversation) private pointerRepo:Repository<PointerConversation>, @InjectRepository(ChannelConfig) private channelConfigRepo: Repository<ChannelConfig>) {
    this.dataSource.entityMetadatas.forEach((em, index) => {
      this.dataSource.entityMetadatas[index].schema = 'project_' + 'vnblnzdm0b3bdcltpvpl' // httpContext.get('PROJECT_UID').toLowerCase()
      this.dataSource.entityMetadatas[index].tablePath = 'project_' + 'vnblnzdm0b3bdcltpvpl' + '.' + em.tableName
    })
  }

  async sendMessage(message:string, waId:string) {
    const twilioClient = twilio(
      process.env.ACCOUNT_SID,
      process.env.AUTH_TOKEN
    )
    await twilioClient.messages.create({
      from: 'whatsapp:+14155238886',
      body: message,
      to: `whatsapp:+${waId}`
    })
  }

  async messageClietHandler(message:string, waId:string, channel_number:string) {
    console.log('Handler')
    const pointer:string = await this.findPointerByWaId(waId)
    const subpointers = pointer ? pointer.split('>') : ['step.1']
    const stepOrder = Number(subpointers[0].replace('step.', ''))
    // if (currentStep.action.includes('menu')) {
    //   this.findMenuById()
    // }
    const config = await this.findConfigByChannelNumber('+55455555')

    const responseTo:string = subpointers[subpointers.length - 1]
    let action:string
    let quiz:Quiz
    let newPointer:string

    if (responseTo.includes('menu')) {
      const menuId = responseTo.split('.')[1]
      const menu = this.findMenuById(Number(menuId), config)
      const optionSelected = this.findOptionFromMenu(Number(message), menu)
      action = optionSelected.action
    }

    if (responseTo.includes('question')) {
      quiz = this.findQuizById(Number(subpointers[subpointers.length - 2].split('.')[1]), config)
      const questionId = Number(responseTo.split('.')[1])
      if (this.existQuestionInQuiz(questionId + 1, quiz)) {
        action = `question.${questionId + 1}`
        subpointers.pop()
        subpointers.push(action)
        newPointer = subpointers.join('>')
      } else {
        const step = this.findStepById(stepOrder, config)
        action = step.action
      }
    }

    if (responseTo.includes('step')) {
      const step = this.findStepById(stepOrder, config)
      action = step.action
    }

    if (action.includes('menu')) {
      if (subpointers.length === 2) subpointers.pop() // esto sucede cuando la opcion escogida continen com action otro menu
      if (subpointers.length === 1) subpointers[0] = `step.${stepOrder + 1}` // esto sucede cuando el step contiene como action un menu
      subpointers.push(action)
      newPointer = subpointers.join('>')
      if (responseTo.includes('question')) { // esto sucede cuando se termina un quiz (osea el quiestio id es el ultimo) y el siguiente paso tiene como action un menu
        newPointer = `step.${stepOrder + 1}>${action}`
      }
    }

    if (action.includes('message')) {
      newPointer = `step.${stepOrder + 1}`
    }

    let messageToSend:string
    if (action.includes('redirect')) {
      messageToSend = 'En breve un asesor se comunicara con usted'
      newPointer = `step.${stepOrder + 1}`
    } else {
      messageToSend = this.builResponseByAction(action, { config, quiz })
    }

    if (action.includes('close')) {
      messageToSend = 'Gracias por comunicarse con nosotros'
      this.deletePointer(waId)
    }
    console.log(action)
    console.log(messageToSend)

    await this.sendMessage(messageToSend, waId)
    console.log({ stepOrder })

    if (stepOrder === 1) {
      await this.updatePointer(waId, newPointer)
    } else {
      await this.createPointer(waId, newPointer)
    }
  }

  async updatePointer(waId:string, newPointer:string) {
    await this.pointerRepo.update({ phone_number: waId }, { pointer: newPointer })
  }

  async createPointer(waId:string, newPointer:string) {
    await this.pointerRepo.insert({ phone_number: waId, pointer: newPointer })
  }

  async deletePointer(waId:string) {
    await this.pointerRepo.update({ phone_number: waId }, { status: 0 })
  }

  async findConfigByChannelNumber(phoneNumber:string):Promise<Config> {
    // const configs = await this.channelConfigRepo.find({ where: { channel_number: phoneNumber } })
    // return configs[0]
    return {
      id: 1,
      menus: [
        {
          id: 1,
          title: 'titulo del menu 1',
          options: [
            {
              id: 1,
              value: 'opcion 1',
              action: 'message.2'
            },
            {
              id: 2,
              value: 'opcion 2',
              action: 'message.3'
            },
            {
              id: 3,
              value: 'opcion 3',
              action: 'menu.2'
            },
            {
              id: 4,
              value: 'opcion 4',
              action: 'message.1'
            }
          ]
        },
        {
          id: 2,
          title: 'titulo del menu de la opcion 3',
          options: [
            {
              id: 1,
              value: 'opcion 1',
              action: 'message.1'
            },
            {
              id: 2,
              value: 'opcion 2',
              action: 'message.1'
            },
            {
              id: 3,
              value: 'opcion 3',
              action: 'message.1'
            },
            {
              id: 4,
              value: 'opcion 4',
              action: 'message.1'
            }
          ]
        }
      ],
      messages: [
        {
          id: 1,
          message: 'hola gracias por escoger la opcion 4'
        },
        {
          id: 2,
          message: 'hola gracias por escoger la opcion 1'
        },
        {
          id: 3,
          message: 'hola gracias por escoger la opcion 2'
        },
        {
          id: 4,
          message: 'Bienvenido '
        }
      ],
      quizes: [
        {
          id: 1,
          questions: [
            {
              id: 1,
              question: '¿Cual es tu email?',
              response_type: 'email', // "string|email|url|phone_number|dni|date",
              error_message: 'por favor se escriba su email'
            },
            {
              id: 2,
              question: '¿Cual es tu numero de celualar?',
              response_type: 'phone_number', // "string|email|url|phone_number|dni|date",
              error_message: 'por favor se escriba su celular'
            }
          ]
        }
      ],
      redirects: [
        {
          id: 1,
          to: 'grupo.5'
        },
        {
          id: 2,
          to: 'whatsapp+51956326148'
        }
      ],
      steps: [
        {
          order: 1,
          action: 'message.4',
          status: 1
        },
        {
          order: 2,
          action: 'quiz.1',
          status: 1
        },
        {
          order: 3,
          action: 'menu.1',
          status: 1
        },
        {
          order: 4,
          action: 'close',
          status: 1
        }
      ]
    }
  }

  async findPointerByWaId(waId:string):Promise<string> {
    const pointers = await this.pointerRepo.find({ where: { phone_number: waId, status: 1 } })
    return pointers.length === 0 ? '' : pointers[0].pointer
    // return 'step2>menu1>option3>menu2'
    // return 'step3>quiz2>question5'
  }

  existQuestionInQuiz(questionId:number, quiz:Quiz) {
    return quiz.questions.some(q => q.id === questionId)
  }

  findQuestionFromQuiz(questionId:number, quiz:Quiz):Question {
    return quiz.questions.find(q => q.id === questionId)
  }

  findQuizById(quizId:number, config:Config):Quiz {
    return config.quizes.find(q => q.id === quizId)
  }

  findStepById(stepOrder:number, config:Config) {
    return config.steps.find(s => s.order === stepOrder)
  }

  findMenuById(menuId:number, config:Config):Menu {
    return config.menus.find(m => m.id === menuId)
  }

  findOptionFromMenu(optionId:number, menu:Menu):Option {
    return menu.options.find(o => o.id === optionId)
  }

  findMessageById(messageId:number, config:Config):Message {
    return config.messages.find(m => m.id === messageId)
  }

  builResponseByAction(action:string, { config, quiz }:{config?:Config, quiz?:Quiz}) : string {
    const [itemType, itemId] = action.split('.')
    let messageResponse = ''
    switch (itemType) {
      case 'menu':
        const menu = this.findMenuById(Number(itemId), config)
        const options = menu.options.map(o => o.id + ' ' + o.value)
        messageResponse = `${menu.title} \n ${options.join('\n')}`
        break
      case 'question':
        const question = this.findQuestionFromQuiz(Number(itemId), quiz)
        messageResponse = question.question
        break
      case 'message':
        const message = this.findMessageById(Number(itemId), config)
        messageResponse = message.message
        break
    }
    return messageResponse
  }
}
