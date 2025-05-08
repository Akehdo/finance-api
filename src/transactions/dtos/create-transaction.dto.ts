import { ApiProperty } from "@nestjs/swagger";
import { IsIn, isIn, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateTransactionDto {
    @ApiProperty({ description: 'сумма транзакции', example: 1000})
    @IsNumber()
    @IsNotEmpty()
    amount: number;
    
    @ApiProperty({ 
        description: 'Тип транзакции',
        enum: ['income', 'expense'],
        example: 'income',
    })
    @IsString()
    @IsNotEmpty()
    @IsIn(['income', 'expense'])
    type: string;

    @ApiProperty({ description: 'Категория транзакции', example: 'food'})
    @IsString()
    @IsNotEmpty()
    category: string;

    @ApiProperty({ description: 'Описание (необязательно)', example: 'Покупка продуктов', required: false })
    @IsString()
    @IsOptional()
    description: string;


}