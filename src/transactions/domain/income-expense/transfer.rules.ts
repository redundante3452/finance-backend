import { Transaction } from "src/transactions/entities/transaction/transaction";
import { BalanceRules } from "./balance.rules";
import { OwnershipValidator } from "./ownership.validator";

export class TransferRules {
    constructor(
        private readonly ownership: OwnershipValidator,
        private readonly balance: BalanceRules,
    ) { }

    async process(transaction: Transaction, userId: string) {
        const sourceAcount = this.ownership.validateAccountOwnership(
            transaction.sourceAccountId!,
            userId,
        )

        const destinationAccount = this.ownership.validateAccountOwnership(
            transaction.destinationAccountId!,
            userId,
        )

        await this.balance.applyTransfer(sourceAcount, destinationAccount, transaction.amount);

    }

}