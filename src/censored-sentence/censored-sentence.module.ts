import { Module } from '@nestjs/common'
import { CensoredSentenceService } from './censored-sentence.service'
import { CensoredSentenceController } from './censored-sentence.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CensoredSentence } from './censored-sentence.entity'

@Module({
  imports: [TypeOrmModule.forFeature([CensoredSentence])],
  controllers: [CensoredSentenceController],
  providers: [CensoredSentenceService]
})
export class CensoredSentenceModule {}
