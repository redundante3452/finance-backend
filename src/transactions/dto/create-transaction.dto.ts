import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateTransactionDto {
  @IsEnum(['INCOME', 'EXPENSE', 'TRANSFER'])
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER';

  @IsNumber()
  @Min(0.01)
  amount: number;

  // INCOME / EXPENSE
  @IsUUID()
  @IsOptional()
  accountId?: string;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  // TRANSFER
  @IsUUID()
  @IsOptional()
  sourceAccountId?: string;

  @IsUUID()
  @IsOptional()
  destinationAccountId?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  date?: string; // o Date, dependiendo cómo lo manejes
}
