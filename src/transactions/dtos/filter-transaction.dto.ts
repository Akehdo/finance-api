import { IsDateString, IsIn, IsOptional, IsString } from "class-validator";

export class FilterTransactionDto {
    @IsOptional()
    @IsIn(['income', 'expense'])
    type?: string;

    @IsOptional()
    @IsString()
    category?: string;

    @IsOptional()
    @IsDateString()
    from?: string;

    @IsOptional()
    @IsDateString()
    to?: string;
}