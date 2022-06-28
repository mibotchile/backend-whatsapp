import { Module } from '@nestjs/common'

import { ResponseValidatorController } from './response-validator.controller'
import { ResposneValidatorService } from './response-validator.service'

@Module({
  controllers: [ResponseValidatorController],
  providers: [ResposneValidatorService]
})
export class ResponseValidatorModule {}
