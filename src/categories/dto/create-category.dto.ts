import { IsString, IsNotEmpty, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum TransactionType {
    INCOME = 'INCOME',
    EXPENSE = 'EXPENSE',
}

export class CreateCategoryDto {
    @ApiProperty({ example: 'Comida', description: 'Nombre de la categoría' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ enum: TransactionType, example: TransactionType.EXPENSE })
    @IsEnum(TransactionType)
    transactionType: TransactionType;

    @ApiProperty({ example: 'fast-food', required: false })
    @IsString()
    @IsOptional()
    icon?: string;

    @ApiProperty({ example: '#FF5733', required: false })
    @IsString()
    @IsOptional()
    color?: string;
}
