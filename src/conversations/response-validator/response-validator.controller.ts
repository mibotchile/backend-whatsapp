import { Controller, Get } from '@nestjs/common'
import { ResponseValidatorRepository } from './response-validator.repository'

@Controller('responseValidator')
export class ResponseValidatorController {
  @Get()
  findAll():any {
    return ResponseValidatorRepository.validators
  }
}
