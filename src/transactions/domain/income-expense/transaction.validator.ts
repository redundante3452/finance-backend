import { BadRequestException } from '@nestjs/common';
import { Transaction } from 'src/transactions/entities/transaction/transaction';

export class TransactionValidator {
    validateTypeAndRequiredFields(transaction: Transaction) {
        if (transaction.type !== 'INCOME' && transaction.type !== 'EXPENSE' && transaction.type !== 'TRANSFER') {
            throw new BadRequestException(
                'Transaction type must be INCOME or EXPENSE or TRANSFER'
            );
        }
        if (transaction.type === 'INCOME' || transaction.type === 'EXPENSE') {
            if (!transaction.accountId || !transaction.categoryId) {
                throw new BadRequestException('Transaction account and category are required');
            }
        }

        if (transaction.type === 'TRANSFER') {
            if (!transaction.sourceAccountId || !transaction.destinationAccountId) {
                throw new BadRequestException('Transaction source and destination accounts are required');
            }
        }


    }

}




