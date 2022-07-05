
import { Config, Message, Menu, Option, Question, Quiz, Redirect } from '../conversation.types'
import { ResponseValidatorRepository } from '../response-validator/response-validator.repository'

export class ChannelConfigUtils {
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
}
