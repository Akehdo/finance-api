// src/transactions/dtos/transaction.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class TransactionDto {
  @ApiProperty({ example: 1, description: 'Уникальный ID транзакции' })
  id: number;

  @ApiProperty({ example: 1000, description: 'Сумма транзакции' })
  amount: number;

  @ApiProperty({
    example: 'income',
    enum: ['income', 'expense'],
    description: 'Тип транзакции'
  })
  type: 'income' | 'expense';

  @ApiProperty({ example: 'groceries', description: 'Категория транзакции' })
  category: string;

  @ApiProperty({ 
    example: 'Покупка продуктов', 
    description: 'Описание (необязательно)', 
    required: false 
  })
  description?: string;

  @ApiProperty({ example: new Date().toISOString(), description: 'Дата создания' })
  createdAt: Date;

  @ApiProperty({ example: new Date().toISOString(), description: 'Дата последнего обновления' })
  updatedAt: Date;
}
