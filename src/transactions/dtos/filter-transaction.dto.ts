import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsIn, IsOptional, IsString } from "class-validator";

export class FilterTransactionDto {
    @ApiPropertyOptional({ description: 'Фильтр по типу', enum: ['income', 'expense'] })
    @IsOptional()
    @IsIn(['income', 'expense'])
    type?: string;

    @ApiPropertyOptional({ description: 'Фильтр по категории' })
    @IsOptional()
    @IsString()
    category?: string;

    @ApiPropertyOptional({ description: 'Дата «от» в формате YYYY-MM-DD', example: '2025-04-01' })
    @IsOptional()
    @IsDateString()
    from?: string;

    @ApiPropertyOptional({ description: 'Дата «до» в формате YYYY-MM-DD', example: '2025-04-18' })
    @IsOptional()
    @IsDateString()
    to?: string;
}