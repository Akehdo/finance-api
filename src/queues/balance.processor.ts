import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { TransactionsService } from 'src/transactions/transactions.service';

@Processor('balance')
export class BalanceProcessor {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Process('recalculate')
  async handleRecalculateBalance(job: Job<{ userId: number }>) {
    const { userId } = job.data;

    console.log(`🔄 Пересчёт баланса для user ${userId}`);
    await this.transactionsService.recalculateUserBalance(userId);
  
  }
}
