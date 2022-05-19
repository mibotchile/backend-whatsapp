import { FactoryProvider, Module, Scope } from '@nestjs/common'
import { REQUEST } from '@nestjs/core'
import { PrismaClient } from '@prisma/client'
import { Request } from 'express'
import { PrismaClientManager } from './prisma-client-manager'

const prismaClientProvider: FactoryProvider<Promise<PrismaClient>> = {
  provide: PrismaClient,
  scope: Scope.REQUEST,
  inject: [REQUEST, PrismaClientManager],
  useFactory: async (request: Request, manager: PrismaClientManager) =>
    await manager.getClient(request)
}

@Module({
  providers: [PrismaClientManager, prismaClientProvider],
  exports: [PrismaClient]
})
export class PrismaModule {}
