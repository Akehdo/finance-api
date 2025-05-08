import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { TransactionGateway } from './transactions.gateway';
import { JwtService } from '@nestjs/jwt';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'balance',
    }),
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService, PrismaService,JwtService, TransactionGateway,],
  exports: [TransactionsService]
})
export class TransactionsModule {}
