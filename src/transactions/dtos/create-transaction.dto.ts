import { IsIn, isIn, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateTransactionDto {
    @IsNumber()
    @IsNotEmpty()
    amount: number;

    @IsString()
    @IsNotEmpty()
    @IsIn(['income', 'expense'])
    type: string;

    @IsString()
    @IsNotEmpty()
    category: string;

    @IsString()
    @IsOptional()
    description: string;


}