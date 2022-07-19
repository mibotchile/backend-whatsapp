import { Controller, Get, Post, Body, Put, Param, Delete, Query } from '@nestjs/common'
import { CensoredSentenceService } from './censored-sentence.service'
import { ApiBody, ApiHeader, ApiQuery, ApiTags } from '@nestjs/swagger'
import { CensoredSentenceDto } from './censored-sentence.dto'
import * as httpContext from 'express-http-context'
import { CensoredSentence } from './censored-sentence.entity'

@Controller('censoredSentence')
@ApiTags('Censored Sentences')
@ApiHeader({ name: 'mibot_session', required: true })
@ApiHeader({
  name: 'Authorization',
  required: true,
  example: 'bearer s4lkjds54g5554sfd65sd56f654df65sd4f5we5454a654j564kjk89hgg3s545kdlfkj'
})
export class CensoredSentenceController {
  constructor(private readonly censoredSentenceService: CensoredSentenceService) {}

  @Post()
  @ApiBody({ type: CensoredSentenceDto, description: 'Create new Censored Sentence' })
  async create(@Body() data: any): Promise<CensoredSentence> {
    data.tags = data.tags ? data.tags : []
    data.created_by = httpContext.get('USER').email
    data.updated_by = ''
    return this.censoredSentenceService.create(this.getProjectUid(), data)
  }

  @Get()
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'pageSize', type: Number, required: false })
  async findAll(@Query() queryParams: any): Promise<CensoredSentence[]> {
    return this.censoredSentenceService.findAll(this.getProjectUid(), {
      pageSize: Number(queryParams.pageSize),
      page: Number(queryParams.page)
    })
  }

  @Get('actives')
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'pageSize', type: Number, required: false })
  async findActives(@Query() queryParams: any): Promise<CensoredSentence[]> {
    console.log(queryParams)
    return this.censoredSentenceService.findActives(this.getProjectUid(), Number(queryParams.pageSize), Number(queryParams.page))
  }

  @Get('inactives')
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'pageSize', type: Number, required: false })
  async findInactives(@Query() queryParams: any): Promise<CensoredSentence[]> {
    return this.censoredSentenceService.findInactives(this.getProjectUid(), Number(queryParams.pageSize), Number(queryParams.page))
  }

  @Get('search')
  @ApiQuery({ name: 'name', type: String, required: false })
  async searchBySentence(@Query() queryParams: any): Promise<CensoredSentence[]> {
    if (!queryParams.name)queryParams.name = ''
    return this.censoredSentenceService.search(this.getProjectUid(), queryParams)
  }

  @Get('/id/:id')
  async findById(@Param('id') id: string): Promise<CensoredSentence> {
    return this.censoredSentenceService.findById(this.getProjectUid(), Number(id))
  }

  @Put(':id')
  @ApiBody({ type: CensoredSentenceDto })
  async update(@Param('id') id: string, @Body() data: any): Promise<CensoredSentence> {
    data.updated_by = httpContext.get('USER').email
    delete data.created_by
    return this.censoredSentenceService.update(this.getProjectUid(), +id, data)
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.censoredSentenceService.disable(this.getProjectUid(), +id)
  }

  getProjectUid() {
    return httpContext.get('PROJECT_UID')
  }
}
