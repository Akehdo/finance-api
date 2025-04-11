import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { UserService } from 'src/user/user.service';

@Module({
  controllers: [TransactionsController],
  providers: [TransactionsService, PrismaService, UserService],
})
export class TransactionsModule {}
