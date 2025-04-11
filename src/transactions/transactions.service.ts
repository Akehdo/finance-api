import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { CreateTransactionDto } from './dtos/create-transaction.dto';
import { Prisma, Transaction } from '@prisma/client';
import { UpdateTransactionDto } from './dtos/update-transactions.dto';
import { FilterTransactionDto } from './dtos/filter-transaction.dto';

@Injectable()
export class TransactionsService {
    constructor(
        private prisma: PrismaService,
    ) {}

    async findAllByUser(userId: number): Promise<Transaction[]>{
        return this.prisma.transaction.findMany({where : { userId }});
    }

    async findOne(id: number, userId: number): Promise<Transaction> {
        const transaction = await this.prisma.transaction.findUnique({ where: {id} });
        if(!transaction){
            throw new BadRequestException(" Транзакции не существует.");
        }

        if(transaction.userId != userId){
            throw new ForbiddenException("Вы не можете просматривать чужие транзакциии");
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

        const change = dto.type === 'income' ? dto.amount: -dto.amount;

        await this.prisma.user.update({
            where: {id: userId},
            data: {
                balance: { increment: change },
            },
        });

        return transaction;
    }

    async remove(id: number, userId: number): Promise<Transaction | null> {
        const transaction = await this.prisma.transaction.findUnique({ where: {id} });

        if(!transaction){
            throw new BadRequestException("Такой транзакции не существует")
        }

        if(transaction.userId != userId){
            throw new ForbiddenException("Вы не можете удалить чужую транзакцию");
        }

        await this.prisma.transaction.delete({
           where: { id }
        });

        const change = transaction.type === 'income' ? -transaction.amount : transaction.amount;

        await this.prisma.user.update({
            where: {id: userId},
            data: {
                balance: { increment: change } ,
            },
        });

        return transaction;
    }

    async update(id: number, dto: UpdateTransactionDto, userId: number): Promise<Transaction> {
        const transaction = await this.prisma.transaction.findUnique({ where: { id } });
      
        if (!transaction) {
          throw new BadRequestException('Такой транзакции не существует');
        }
      
        if (transaction.userId !== userId) {
          throw new ForbiddenException('Вы не можете обновлять чужие транзакции');
        }
      
        const oldAmount = transaction.amount;
        const oldType = transaction.type;
      
        const newAmount = dto.amount ?? transaction.amount;
        const newType = dto.type ?? transaction.type;
      
        let change = 0;
      
        if (oldType === newType) {
          change = newType === 'income'
            ? newAmount - oldAmount //true
            : oldAmount - newAmount; //false
        } else {
          change = newType === 'income'
            ? oldAmount + newAmount //true
            : -(oldAmount + newAmount); //false
        }
      
        await this.prisma.user.update({
          where: { id: userId },
          data: {
            balance: {
              increment: change,
            },
          },
        });
      
        const updated = await this.prisma.transaction.update({
          where: { id },
          data: {
            amount: dto.amount,
            type: dto.type,
            category: dto.category,
            description: dto.description,
          },
        });
      
        return updated;
      }
      
    async getSummary(userId: number) : Promise<{
        income: number,
        expense: number,
        balance: number,
    }> {
        const resultIncome = await this.prisma.transaction.aggregate({
            _sum: { amount: true },
            where: { userId, type: 'income' },
        });

        const resultExpense = await this.prisma.transaction.aggregate({
            _sum: { amount: true },
            where: { userId, type: 'expense' },
        });

        const income = resultIncome._sum.amount ?? 0;
        const expense = resultExpense._sum.amount ?? 0;
        const balance = income - expense;

        return { 
            income,
            expense,
            balance,
        };
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
}
