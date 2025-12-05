import { BadRequestException } from '@nestjs/common';
import { OwnershipValidator } from './ownership.validator';
import { BalanceRules } from './balance.rules';
import { Transaction } from 'src/transactions/entities/transaction/transaction.entity';

export class IncomeExpenseRules {
  constructor(
    private readonly ownership: OwnershipValidator,
    private readonly balance: BalanceRules,
  ) {}

  async process(transaction: Transaction, userId: string) {
    const account = await this.ownership.validateAccountOwnership(
      transaction.accountId!,
      userId,
    );

    const category = await this.ownership.validateCategoryOwnership(
      transaction.categoryId!,
      userId,
    );

    if (transaction.type !== category.transactionType) {
      throw new BadRequestException(
        'Transaction type does not match category type',
      );
    }

    if (transaction.type === 'INCOME') {
      await this.balance.applyIncome(account, transaction.amount);
    } else if (transaction.type === 'EXPENSE') {
      await this.balance.applyExpense(account, transaction.amount);
    }
  }
}
