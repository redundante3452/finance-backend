import { BadRequestException } from '@nestjs/common';
import { Transaction } from 'src/transactions/entities/transaction/transaction';
import { UpdateTransactionDto } from 'src/transactions/dto/update-transaction.dto/update-transaction.dto';
import { BalanceRules } from './balance.rules';
import { OwnershipValidator } from './ownership.validator';

export class UpdateTransactionRules {
    constructor(
        private readonly balance: BalanceRules,
        private readonly ownership: OwnershipValidator,
    ) { }

    async process(oldTransaction: Transaction, newTransactionDto: UpdateTransactionDto, userId: string) {
        // 1. Revertir el efecto de la transacción anterior
        await this.revertBalance(oldTransaction, userId);

        // 2. Preparar la "nueva" transacción fusionando datos
        // Nota: No modificamos la entidad original aún, solo simulamos para validar y aplicar nuevo balance
        const simulatedTransaction = { ...oldTransaction, ...newTransactionDto } as Transaction;

        // 3. Validar y aplicar nuevo balance
        await this.applyNewBalance(simulatedTransaction, userId);
    }

    private async revertBalance(transaction: Transaction, userId: string) {
        if (transaction.type === 'INCOME') {
            const account = await this.ownership.validateAccountOwnership(transaction.accountId!, userId);
            await this.balance.revertIncome(account, Number(transaction.amount));
        } else if (transaction.type === 'EXPENSE') {
            const account = await this.ownership.validateAccountOwnership(transaction.accountId!, userId);
            await this.balance.revertExpense(account, Number(transaction.amount));
        } else if (transaction.type === 'TRANSFER') {
            const source = await this.ownership.validateAccountOwnership(transaction.sourceAccountId!, userId);
            const destination = await this.ownership.validateAccountOwnership(transaction.destinationAccountId!, userId);
            await this.balance.revertTransfer(source, destination, Number(transaction.amount));
        }
    }

    private async applyNewBalance(transaction: Transaction, userId: string) {
        if (transaction.type === 'INCOME') {
            const account = await this.ownership.validateAccountOwnership(transaction.accountId!, userId);
            await this.balance.applyIncome(account, Number(transaction.amount));
        } else if (transaction.type === 'EXPENSE') {
            const account = await this.ownership.validateAccountOwnership(transaction.accountId!, userId);
            await this.balance.applyExpense(account, Number(transaction.amount));
        } else if (transaction.type === 'TRANSFER') {
            const source = await this.ownership.validateAccountOwnership(transaction.sourceAccountId!, userId);
            const destination = await this.ownership.validateAccountOwnership(transaction.destinationAccountId!, userId);
            await this.balance.applyTransfer(source, destination, Number(transaction.amount));
        }
    }
}
