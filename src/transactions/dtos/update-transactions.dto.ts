import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateTransactionDto {
    @ApiPropertyOptional({ description: 'Новая сумма' })
    @IsOptional()
    @IsNumber()
    amount?: number;

    @ApiPropertyOptional({ description: 'Новый тип транзакции', enum: ['income', 'expense'] })
    @IsOptional()
    @IsString()
    @IsIn(['income', 'expense'])
    type?: string;

    @ApiPropertyOptional({ description: 'Новая категория' })
    @IsOptional()  
    @IsString()
    category?: string;

    @ApiPropertyOptional({ description: 'Новое описание' })
    @IsOptional()  
    @IsString()
    description?: string;
}