import { BadRequestException } from '@nestjs/common';
import { AccountsService } from 'src/accounts/accounts.service';

export class BalanceRules {
    constructor(
        private readonly accountService: AccountsService,
    ) { }

    async applyIncome(account, amount: number) {
        const Newbalance = Number(account.balance) + amount
        await this.accountService.update(account.id, {
            balance: Newbalance,
        })
    }

    async applyExpense(account, amount: number) {
        const currentBalance = Number(account.balance)
        if (currentBalance < amount) {
            throw new BadRequestException('Insufficient balance')
        }
        const newBalance = currentBalance - amount
        await this.accountService.update(account.id, {
            balance: newBalance,
        })
    }

    async applyTransfer(source, destination, amount: number) {
        if (source.balance < amount) {
            throw new BadRequestException('Insufficient balance');
        }

        const newSource = source.balance - amount;
        const newDestination = destination.balance + amount;

        await this.accountService.update(source.id, {
            balance: newSource,
        })
        await this.accountService.update(destination.id, {
            balance: newDestination,
        })

        return { newSource, newDestination };
    }

}
