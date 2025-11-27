import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Transaction } from './entities/transaction/transaction';
import { CreateTransactionDto } from './dto/create-transaction.dto';

import { AccountsService } from 'src/accounts/accounts.service';
import { CategoriesService } from 'src/categories/categories.service';

// Importamos las clases de dominio
import { TransactionValidator } from './domain/income-expense/transaction.validator';
import { OwnershipValidator } from './domain/income-expense/ownership.validator';
import { BalanceRules } from './domain/income-expense/balance.rules';
import { IncomeExpenseRules } from './domain/income-expense/income-expense.rules';
import { TransferRules } from './domain/income-expense/transfer.rules';

@Injectable()
export class TransactionsService {
    constructor(
        @InjectRepository(Transaction)
        private readonly transactionRepository: Repository<Transaction>,
        private readonly accountService: AccountsService,
        private readonly categoryService: CategoriesService,
    ) { }

    async createTransaction(
        createTransactionDto: CreateTransactionDto,
        userId: string,
    ) {
        // 1. Crear la entidad a partir del DTO
        const transaction = this.transactionRepository.create(createTransactionDto);

        // 2. Instanciar helpers de dominio
        const validator = new TransactionValidator();

        const ownershipValidator = new OwnershipValidator(
            this.accountService,
            this.categoryService,
        );

        const balanceRules = new BalanceRules(this.accountService);

        const incomeExpenseRules = new IncomeExpenseRules(
            ownershipValidator,
            balanceRules,
        );

        const transferRules = new TransferRules(
            ownershipValidator,
            balanceRules,
        );

        // 3. Validaciones básicas (tipo + campos requeridos)
        validator.validateTypeAndRequiredFields(transaction);

        // 4. Lógica de negocio según tipo de transacción
        if (transaction.type === 'INCOME' || transaction.type === 'EXPENSE') {
            await incomeExpenseRules.process(transaction, userId);
        } else if (transaction.type === 'TRANSFER') {
            await transferRules.process(transaction, userId);
        }

        // 5. Guardar la transacción
        return await this.transactionRepository.save(transaction);
    }
}
