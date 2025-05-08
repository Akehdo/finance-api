import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { BalanceProcessor } from './balance.processor';
import { PrismaModule } from 'src/shared/prisma/prisma.module';
import { TransactionsModule } from 'src/transactions/transactions.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'balance',
    }),
    TransactionsModule,
  PrismaModule],
  providers: [BalanceProcessor],
  exports: [BullModule,],
})
export class QueuesModule {}
