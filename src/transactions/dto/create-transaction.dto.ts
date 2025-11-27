import {
    IsUUID,
    IsOptional,
    IsString,
    IsNumber,
    IsPositive,
    IsIn,
    IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTransactionDto {

    // ------ Tipo de transacción ------
    @ApiProperty({ example: 'EXPENSE', description: 'Tipo de transacción: INCOME, EXPENSE o TRANSFER' })
    @IsIn(['INCOME', 'EXPENSE', 'TRANSFER'])
    type: string;

    // ------ Datos comunes ------
    @ApiProperty({ example: 50000, description: 'Monto de la transacción' })
    @IsNumber()
    @IsPositive()
    amount: number;

    @ApiProperty({ example: '2023-11-26', description: 'Fecha de la transacción (ISO 8601)' })
    @IsDateString()
    date: string;

    @ApiPropertyOptional({ example: 'Almuerzo', description: 'Descripción opcional' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ example: 'Restaurante X', description: 'Comercio o entidad relacionada' })
    @IsOptional()
    @IsString()
    merchant?: string;

    @ApiPropertyOptional({ example: 'MANUAL', description: 'Origen del dato', enum: ['MANUAL', 'RECEIPT_AI', 'IMPORT'] })
    @IsOptional()
    @IsIn(['MANUAL', 'RECEIPT_AI', 'IMPORT'])
    origin?: string;

    // ------ Para INCOME / EXPENSE ------
    @ApiPropertyOptional({ example: 'uuid-account-id', description: 'ID de la cuenta afectada' })
    @IsOptional()
    @IsUUID()
    accountId?: string;

    @ApiPropertyOptional({ example: 'uuid-category-id', description: 'ID de la categoría' })
    @IsOptional()
    @IsUUID()
    categoryId?: string;

    // ------ Para TRANSFER ------
    @ApiPropertyOptional({ example: 'uuid-source-id', description: 'ID cuenta origen (solo transferencias)' })
    @IsOptional()
    @IsUUID()
    sourceAccountId?: string;

    @ApiPropertyOptional({ example: 'uuid-dest-id', description: 'ID cuenta destino (solo transferencias)' })
    @IsOptional()
    @IsUUID()
    destinationAccountId?: string;
}
