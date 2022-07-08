import { Injectable, Inject, forwardRef, Global } from '@nestjs/common'
import { Config, Quiz } from '../conversation.types'
import { ChannelConfigUtils } from './channel-config.utils'
import { ConversationService } from '../conversation/conversation.service'
import { TwilioService } from '../twilio/twilio.service'
import { PointerConversationService } from './pointer-conversation.service'
import { ChannelConfigService } from 'src/channel/channel-config/channel-config.service'
import { MessageService } from '../messages/message.service'
import { ConversationGateway } from '../conversation-gateway/conversation.gateway'

@Global()
@Injectable()
export class ConversationManagerService {
  private configUtils:ChannelConfigUtils
  constructor(
    @Inject(forwardRef(() => ConversationGateway)) private readonly conversationGateway: ConversationGateway,
    @Inject(forwardRef(() => ConversationService))
    private conversationService:ConversationService,
    private twilioService:TwilioService,
    private pointerService:PointerConversationService,
    private channelConfigService:ChannelConfigService,
    private messageService:MessageService
  ) {
    this.configUtils = new ChannelConfigUtils()
  }

  async messageClientHandler(messageInfo:any, waId: string, channel_number: string, saveMessage = true) {
    const message = messageInfo.Body
    channel_number = '+19206787641'
    // console.log('Handler')
    // console.log(JSON.stringify(config, null, '\t'))
    const pointerDB = await this.pointerService.findByWaId(waId)
    let subpointers = pointerDB ? pointerDB.pointer.split('>') : ['step.1']
    let config
    let conversationId = 1
    let conversationManager:string
    const now = new Date().toISOString()
    // const now = new Intl.DateTimeFormat('af-ZA', { year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: 'numeric', second: 'numeric', timeZone: 'UTC' }).format(Date.now())

    if (!pointerDB) {
      config = await this.channelConfigService.findByChannelNumber('+19206787641')
      subpointers = ['step.1']
      const conversation = await this.conversationService.save({
        channel_number,
        client_number: waId,
        client_name: messageInfo.ProfileName ?? '',
        manager: 'system',
        created_by: 'System',
        updated_by: '',
        created_at: now,
        updated_at: now,
        status: 1
      })
      conversationId = Number(conversation.identifiers[0].id)
      conversationManager = 'system'
      console.log('CONVERSATION ----------------------', JSON.stringify(conversation))
    } else {
      config = pointerDB.config
      conversationId = Number(pointerDB.conversation_id)
      conversationManager = pointerDB.conversation_manager
    }
    if (saveMessage) {
      await this.messageService.save({
        sid: messageInfo.MessageSid,
        conversation_id: conversationId,
        content_type: 'text',
        message,
        media_url: '',
        from_client: true,
        message_status: 'received',
        created_at: now,
        created_by: 'system',
        status: 1
      }, true)
    }
    if (!conversationManager.toLowerCase().includes('system')) {
      return
    }
    console.log({ subpointers })

    let stepOrder = Number(subpointers[0].replace('step.', ''))

    if (!this.configUtils.existStep(stepOrder, config)) {
      await this.pointerService.delete(waId)
      await this.pointerService.create({ phone_number: waId, pointer: 'step.1', config, conversation_id: conversationId, conversation_manager: 'system', status: 1 })
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
      const menu = this.configUtils.findMenuById(Number(menuId), config)
      if (!this.configUtils.isValidOption(message, menu)) {
        await this.twilioService.sendMessage('Por favor elija una opcion valida', channel_number, waId, conversationId)
        return
      }
      const optionSelected = this.configUtils.findOptionFromMenu(Number(message), menu)
      action = optionSelected.action
    }

    if (responseTo.includes('question')) {
      quiz = this.configUtils.findQuizById(Number(subpointers[subpointers.length - 2].split('.')[1]), config)
      const questionId = Number(responseTo.split('.')[1])
      const question = this.configUtils.findQuestionFromQuiz(questionId, quiz)
      if (!this.configUtils.isValidQuestionResponse(question, message)) {
        await this.twilioService.sendMessage(question.error_message, channel_number, waId, conversationId)
        return
      }
      if (this.configUtils.existQuestionInQuiz(questionId + 1, quiz)) {
        action = `question.${questionId + 1}`
        subpointers.pop()
        subpointers.push(action)
        newPointer = subpointers.join('>')
      } else {
        // console.log('question else')
        stepOrder += 1
        const step = this.configUtils.findStepById(stepOrder, config)
        action = step.action
      }
    }

    if (responseTo.includes('step')) {
      const step = this.configUtils.findStepById(stepOrder, config)
      action = step.action

      if (step.action.includes('quiz')) {
        const quizId = Number(step.action.split('.')[1])
        quiz = this.configUtils.findQuizById(quizId, config)
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

      await this.twilioService.sendMessage(messageToSend, channel_number, waId, conversationId)
      newPointer = `step.${stepOrder + 1}`
      if (stepOrder === 1) {
        await this.pointerService.create({ phone_number: waId, pointer: newPointer, config, conversation_id: conversationId, conversation_manager: 'system', status: 1 })
      } else {
        await this.pointerService.updateByPhoneNumber(waId, { pointer: newPointer })
      }
      if (!this.configUtils.existStep(stepOrder + 1, config)) {
        action = 'close'
      } else {
        await this.messageClientHandler(messageInfo, waId, channel_number, false)
        return
      }
    }

    if (action.includes('menu')) {
      console.log('lengthhhhhhhh-> ', subpointers.length)
      if (subpointers.length === 1) {
        subpointers[0] = `step.${stepOrder}` // esto sucede cuando el step contiene como action un menu}
      } else {
        subpointers.pop()
      }
      //   if (subpointers.length === 1) subpointers[0] = `step.${stepOrder + 1}` // esto sucede cuando el step contiene como action un menu
      // if (subpointers.length === 2) subpointers.pop() // esto sucede cuando la opcion escogida continen com action otro menu
      subpointers.push(action)
      newPointer = subpointers.join('>')
      if (responseTo.includes('question')) {
        // esto sucede cuando se termina un quiz (osea el quiestion id es el ultimo) y el siguiente paso tiene como action un menu
        newPointer = `step.${stepOrder}>${action}`
      }
    }

    if (action.includes('redirect')) {
      messageToSend = 'En breve un asesor se comunicara con usted'
      await this.twilioService.sendMessage(messageToSend, channel_number, waId, conversationId)
      const redirect = this.configUtils.findRedirectById(Number(action.split('.')[1]), config)
      const [manager, managerId] = redirect.to.split('.')
      await this.conversationService.updateManager(conversationId, manager as 'system'|'user'|'group', Number(managerId))
      const conversation = await this.conversationService.findById(conversationId)
      this.conversationGateway.emitNewConversation(conversation)
      conversationManager = redirect.to
      newPointer = `step.${stepOrder + 1}`
    } else {
      messageToSend = this.builResponseByAction(action, { config, quiz })
    }

    if (action.includes('close')) {
      messageToSend = 'Gracias por comunicarse con nosotros'
      await this.pointerService.delete(waId)
    } else {
      if (stepOrder === 1) {
        await this.pointerService.create({ phone_number: waId, pointer: newPointer, config, conversation_id: conversationId, conversation_manager: conversationManager, status: 1 })
      } else {
        await this.pointerService.updateByPhoneNumber(waId, { pointer: newPointer, conversation_manager: conversationManager })
      }
    }
    console.log({ action })
    console.log({ messageToSend })

    await this.twilioService.sendMessage(messageToSend, channel_number, waId, conversationId)
    console.log({ stepOrder })
  }

  builResponseByAction(action: string, { config, quiz }: { config?: Config; quiz?: Quiz }): string {
    const [itemType, itemId] = action.split('.')
    let messageResponse = ''
    switch (itemType) {
      case 'menu':
        const menu = this.configUtils.findMenuById(Number(itemId), config)
        const options = menu.options.map((o) => `*${o.id}.* ${o.value}`)
        messageResponse = `*${menu.title}*\n\n${options.join('\n')}`
        break
      case 'question':
        const question = this.configUtils.findQuestionFromQuiz(Number(itemId), quiz)
        messageResponse = question.question
        break
      case 'quiz':
        const question1 = quiz.questions[0]
        messageResponse = question1.question
        break
      case 'message':
        const message = this.configUtils.findMessageById(Number(itemId), config)
        messageResponse = message.message
        break
    }
    return messageResponse
  }
}
