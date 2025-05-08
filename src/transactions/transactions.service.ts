import { BadRequestException, ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { CreateTransactionDto } from './dtos/create-transaction.dto';
import { Prisma, Transaction } from '@prisma/client';
import { UpdateTransactionDto } from './dtos/update-transactions.dto';
import { FilterTransactionDto } from './dtos/filter-transaction.dto';
import { TransactionGateway } from './transactions.gateway';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class TransactionsService {
    constructor(
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private readonly prisma: PrismaService,
        private readonly gateway: TransactionGateway,  
        @InjectQueue('balance') private balanceQueue: Queue,
    ) {}

    async findAllByUser(userId: number, query: { page?: number, limit?: number } ): Promise<Transaction[]>{
        
        const page = query.page || 1;
        const limit = query.limit || 2;
        const offset = (page - 1) * limit;

        const cacheKey = `transactions: ${userId}: page=${page}&limit=${limit}`;

        const cached = await this.cacheManager.get<Transaction[]>(cacheKey);
        if(cached){
            console.log('return from cache');
            return cached;
        }   

        const transactions = await this.prisma.transaction.findMany({ 
            where : { userId }, 
            orderBy: { createdAt: "desc" },
            skip: offset,
            take: limit,
        });
        

        await this.cacheManager.set(cacheKey, transactions, 30_000);

        return transactions;
    }

    async findOne(id: number, userId: number): Promise<Transaction> {
        const transaction = await this.prisma.transaction.findUnique({ where: { id, userId } });
        if(!transaction){
            throw new BadRequestException(" Транзакции не существует.");
        }

        return transaction;
    }

    async create(dto: CreateTransactionDto, userId: number): Promise<Transaction> {
        const transaction = await this.prisma.transaction.create({
            data: {
                amount: dto.amount,
                type: dto.type,
                category: dto.category,
                description: dto.description,
                user: {
                    connect: { id: userId }
                }
            },
        });

        await this.balanceQueue.add('recalculate', { userId });

        this.gateway.sendTransactionEvent("transaction created", transaction);

        return transaction;
    }

    async remove(id: number, userId: number): Promise<Transaction | null> {
        const transaction = await this.prisma.transaction.findFirst({ where: { id, userId } });

        if(!transaction){
            throw new BadRequestException("Такой транзакции не существует")
        }

        await this.prisma.transaction.delete({
           where: { id }
        });

        await this.balanceQueue.add('recalculate', { userId });


        this.gateway.sendTransactionEvent("transaction removed", transaction);

        return transaction;
    }

    async update(id: number, dto: UpdateTransactionDto, userId: number): Promise<Transaction> {
        const transaction = await this.prisma.transaction.findUnique({ where: { id, userId } });
      
        if (!transaction) {
          throw new BadRequestException('Такой транзакции не существует');
        }
            
        const updatedTransaction = await this.prisma.transaction.update({
          where: { id },
          data: {
            amount: dto.amount,
            type: dto.type,
            category: dto.category,
            description: dto.description,
          },
        });
      
        await this.balanceQueue.add('recalculate', { userId });
        
        this.gateway.sendTransactionEvent('transaction updated', updatedTransaction);
      
        return updatedTransaction;
      }
      
      
    async getSummary(userId: number) {
        const groups = await this.prisma.transaction.groupBy({
            by: ['type'],
            _sum: { amount: true },
            where: { userId },
        });

        let income = 0;
        let expense = 0;

        for(const g of groups) {
            if(g.type === 'income') income = g._sum.amount ?? 0;
            if(g.type === 'expense') expense = g._sum.amount ?? 0;
        }

        return { income, expense, balance: income - expense};
    }

    async filterByType(type: string):Promise<Transaction[]> { 
        return await this.prisma.transaction.findMany({
            where: { type },
        });
    }

    async filterByDate(from: string, to: string): Promise<Transaction[]> {
        return await this.prisma.transaction.findMany({
            where: { 
                createdAt: {
                    gte: new Date(from),
                    lte: new Date(to),
                },
            },
        });
    }

    async filterByCategory(category: string): Promise<Transaction[]> {
        return await this.prisma.transaction.findMany({
            where: { category },
        });
    }

    async filterTransactions(userId: number, filters: FilterTransactionDto): Promise<Transaction[]> {
        const { type, category, from, to } = filters;

        const where: Prisma.TransactionWhereInput = {
            userId,
        };

        if(type){ where.type = type }
        if(category){ where.category = category }
        if(from || to ) {
            where.createdAt = { };
            if(from) { where.createdAt.gte = new Date(from) }
            if(to) { where.createdAt.lte = new Date(to) }
        }
        

        return await this.prisma.transaction.findMany( { where } );
    }
   

    async recalculateUserBalance(userId: number): Promise<void> {
        const transaction = await this.prisma.transaction.findMany({ where: { userId} });

        const newBalance = transaction.reduce((acc, t ) => {
            return t.type === 'income' ? acc + t.amount : acc - t.amount;
        }, 0);

        await this.prisma.user.update({
            where: { id: userId },
            data: { balance: newBalance },
          });
    }
      
      
}
