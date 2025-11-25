import {
    IsUUID,
    IsOptional,
    IsString,
    IsNumber,
    IsPositive,
    IsIn,
    IsDateString,
} from 'class-validator';

export class CreateTransactionDto {

    // ------ Tipo de transacción ------
    @IsIn(['INCOME', 'EXPENSE', 'TRANSFER'])
    type: string;

    // ------ Datos comunes ------
    @IsNumber()
    @IsPositive()
    amount: number;

    @IsDateString()
    date: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    merchant?: string;

    @IsOptional()
    @IsIn(['MANUAL', 'RECEIPT_AI', 'IMPORT'])
    origin?: string;

    // ------ Para INCOME / EXPENSE ------
    @IsOptional()
    @IsUUID()
    accountId?: string;

    @IsOptional()
    @IsUUID()
    categoryId?: string;

    // ------ Para TRANSFER ------
    @IsOptional()
    @IsUUID()
    sourceAccountId?: string;

    @IsOptional()
    @IsUUID()
    destinationAccountId?: string;
}
