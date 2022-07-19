import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { CensoredSentence } from './censored-sentence.entity'
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import { DataSource, ILike, In, Not, Repository } from 'typeorm'

@Injectable()
export class CensoredSentenceService {
  constructor (
    @InjectDataSource() private dataSource:DataSource,
     @InjectRepository(CensoredSentence) private censoredSentenceRepo: Repository<CensoredSentence>
  ) {
  }

  setSchema(schema:string) {
    this.dataSource.entityMetadatas.forEach((em, index) => {
      this.dataSource.entityMetadatas[index].schema = schema
      this.dataSource.entityMetadatas[index].tablePath = `${schema}.${em.tableName}`
    })
  }

  buildSchemaName(projectUid:string) {
    return 'project_' + projectUid.toLowerCase()
  }

  async create (projectUid:string, data: CensoredSentence): Promise<any> {
    this.setSchema(this.buildSchemaName(projectUid))

    const censoredSentences = await this.censoredSentenceRepo.find({
      where: {
        sentence: ILike(data.sentence)
      }
    })
    if (censoredSentences.length > 0) {
      if (censoredSentences[0].status === 0) {
        await this.censoredSentenceRepo.update(censoredSentences[0].id, { status: 1 })
        this.showHttpException('Se activo esta frase censurada', HttpStatus.NOT_ACCEPTABLE)
      }
      this.showHttpException('Ya existe esta frase censurada', HttpStatus.NOT_ACCEPTABLE)
    }
    const newCensoredSentence = await this.censoredSentenceRepo.insert(data)
    return {
      data: newCensoredSentence,
      success: true,
      message: 'frase censurada creado exitosamente'
    }
  }

  async update (projectUid:string, id: number, data: CensoredSentence): Promise<any> {
    this.setSchema(this.buildSchemaName(projectUid))

    if (data.sentence) {
      const censoredSentences = await this.censoredSentenceRepo.find({
        where: {
          sentence: ILike(data.sentence),
          id: Not(id)
        }
      })

      if (censoredSentences.length > 0) {
        if (censoredSentences[0].status === 0) {
          await this.censoredSentenceRepo.update(censoredSentences[0].id, { status: 1 })
          this.showHttpException('Ya existia esta frase censurada y se activo', HttpStatus.NOT_ACCEPTABLE)
        }
        this.showHttpException('Ya existe esta frase cesurada', HttpStatus.NOT_ACCEPTABLE)
      }
    }

    const dataRes = await this.censoredSentenceRepo.update(id, data)
    return {
      data: dataRes,
      success: true,
      message: 'Frase censurada actualizado exitosamente'
    }
  }

  async findManyByIds (projectUid:string, ids:number[]): Promise<any> {
    this.setSchema(this.buildSchemaName(projectUid))

    if (ids.length === 0) return []
    const censoredSentences = await this.censoredSentenceRepo.find({
      where: {
        id: In(ids)
      }
    })
    return censoredSentences
  }

  async findAll (projectUid:string, { pageSize, page }): Promise<any> {
    this.setSchema(this.buildSchemaName(projectUid))

    pageSize = Number(pageSize)
    page = Number(page)
    const pagination = {} as any

    if (!isNaN(pageSize) && !isNaN(page)) {
      page -= 1
      const skip = (page < 0 ? 0 : page) * pageSize
      pagination.skip = skip
      pagination.take = pageSize
    }
    const censoredSentences = await this.censoredSentenceRepo.find({
      ...pagination,
      order: { id: 'asc' }
    })
    const length = await this.censoredSentenceRepo.createQueryBuilder().getCount()

    return {
      data: {
        page,
        pageSize,
        length,
        censoredSentences
      },
      success: true,
      message: 'Lista de todos los frase censuradas'
    }
  }

  async finder (projectUid:string, pageSize = 0, page = 0, where = {}) {
    this.setSchema(this.buildSchemaName(projectUid))

    pageSize = Number(pageSize)
    page = Number(page)
    const pagination = {} as any

    if (!isNaN(pageSize) && !isNaN(page)) {
      page -= 1
      const skip = (page < 0 ? 0 : page) * pageSize
      pagination.skip = skip
      pagination.take = pageSize
    }
    const censoredSentences = await this.censoredSentenceRepo.find({
      ...pagination,
      where,
      order: { id: 'asc' }
    })
    if (censoredSentences.length === 0) {
      throw new HttpException(
        {
          data: [],
          success: false,
          message: 'No existen frase censuradas que coincidan con '
        },
        HttpStatus.OK
      )
    }
    const length = await this.censoredSentenceRepo.createQueryBuilder().where('CensoredSentence.status=1').getCount()

    return { censoredSentences, length }
  }

  async findActives (projectUid:string, pageSize = 0, page = 0): Promise<any> {
    this.setSchema(this.buildSchemaName(projectUid))

    pageSize = Number(pageSize)
    page = Number(page)
    const pagination = {} as any

    if (!isNaN(pageSize) && !isNaN(page)) {
      page -= 1
      const skip = (page < 0 ? 0 : page) * pageSize
      pagination.skip = skip
      pagination.take = pageSize
    }
    const censoredSentences = await this.censoredSentenceRepo.find({
      ...pagination,
      where: { status: 1 },
      order: { id: 'asc' }
    })

    const length = await this.censoredSentenceRepo.createQueryBuilder().where('CensoredSentence.status=1').getCount()// aggrgations._count.id
    return {
      data: {
        page,
        pageSize,
        length,
        censoredSentences
      },
      success: true,
      message: 'Lista de frase censuradas activos'
    }
  }

  async findInactives (projectUid:string, pageSize = 0, page = 0): Promise<any> {
    this.setSchema(this.buildSchemaName(projectUid))

    pageSize = Number(pageSize)
    page = Number(page)
    const pagination = {} as any

    if (!isNaN(pageSize) && !isNaN(page)) {
      page -= 1
      const skip = (page < 0 ? 0 : page) * pageSize
      pagination.skip = skip
      pagination.take = pageSize
    }
    const censoredSentences = await this.censoredSentenceRepo.find({
      ...pagination,
      where: { status: 0 },
      order: { id: 'asc' }
    })
    const length = await this.censoredSentenceRepo.createQueryBuilder().where('CensoredSentence.status=0').getCount()// aggrgations._count.id
    return {
      data: {
        page,
        pageSize,
        length,
        censoredSentences
      },
      success: true,
      message: 'Lista de frase censuradas inactivos'
    }
  }

  async findById (projectUid:string, id: number): Promise<any> {
    this.setSchema(this.buildSchemaName(projectUid))

    const censoredSentence = await this.censoredSentenceRepo.findOne({
      where: { id }
    })
    return {
      data: censoredSentence,
      success: true,
      message: 'censoredSentence'
    }
  }

  async search (projectUid:string, { pageSize, page, sentence }): Promise<any> {
    this.setSchema(this.buildSchemaName(projectUid))

    pageSize = Number(pageSize)
    page = Number(page)
    const pagination = {} as any

    if (!isNaN(pageSize) && !isNaN(page)) {
      page -= 1
      const skip = (page < 0 ? 0 : page) * pageSize
      pagination.skip = skip
      pagination.take = pageSize
    }
    console.log(ILike(`%${sentence}%`))

    const censoredSentences = await this.censoredSentenceRepo.find({
      where: {
        sentence: ILike(`%${sentence}%`)
      },
      ...pagination

    })

    if (censoredSentences.length === 0) {
      throw new HttpException(
        {
          data: [],
          success: false,
          message: 'No existen frase censuradas que coincidan con este nombre'
        },
        HttpStatus.OK
      )
    }
    const length = await this.censoredSentenceRepo.createQueryBuilder().where(`CensoredSentence.sentence ILIKE '%${sentence}%'`).getCount()
    return {
      data: {
        page,
        pageSize,
        length,
        censoredSentences
      },
      success: true,
      message: 'user'
    }
  }

  async disable (projectUid:string, id: number) {
    this.setSchema(this.buildSchemaName(projectUid))

    const censoredSentenceDeleted = await this.censoredSentenceRepo.update(id, { status: 0 })
    return {
      data: censoredSentenceDeleted,
      success: true,
      message: 'Frase censurada desactivado aexitosamente'
    }
  }

  showHttpException(message:string, status:HttpStatus) {
    throw new HttpException(
      {
        data: [],
        success: false,
        message
      },
      status
    )
  }
}
