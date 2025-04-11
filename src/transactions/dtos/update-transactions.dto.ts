import { IsIn, IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateTransactionDto {
    @IsOptional()
    @IsNumber()
    amount?: number;

    @IsOptional()
    @IsString()
    @IsIn(['income', 'expense'])
    type?: string;

    @IsOptional()  
    @IsString()
    category?: string;

    @IsOptional()  
    @IsString()
    description?: string;
}