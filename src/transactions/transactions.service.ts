import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindOptionsWhere } from 'typeorm';

import { Transaction } from './entities/transaction/transaction';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto/update-transaction.dto';
import { FilterTransactionDto } from './dto/filter-transaction.dto/filter-transaction.dto';

import { AccountsService } from 'src/accounts/accounts.service';
import { CategoriesService } from 'src/categories/categories.service';

// Importamos las clases de dominio
import { TransactionValidator } from './domain/income-expense/transaction.validator';
import { OwnershipValidator } from './domain/income-expense/ownership.validator';
import { BalanceRules } from './domain/income-expense/balance.rules';
import { IncomeExpenseRules } from './domain/income-expense/income-expense.rules';
import { TransferRules } from './domain/income-expense/transfer.rules';
import { UpdateTransactionRules } from './domain/income-expense/update-transaction.rules';

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
        // Asignar userId explícitamente si no se hizo antes (aunque process lo suele validar, el save lo requiere)
        transaction.userId = userId;
        return await this.transactionRepository.save(transaction);
    }

    async findAll(filterDto: FilterTransactionDto, userId: string) {
        const { type, startDate, endDate, accountId, categoryId } = filterDto;

        const where: FindOptionsWhere<Transaction> = { userId };

        if (type) {
            where.type = type;
        }

        if (startDate && endDate) {
            where.date = Between(new Date(startDate), new Date(endDate));
        } else if (startDate) {
            where.date = Between(new Date(startDate), new Date()); // Hasta hoy si no se especifica fin
        }

        if (accountId) {
            where.accountId = accountId;
        }

        if (categoryId) {
            where.categoryId = categoryId;
        }

        return await this.transactionRepository.find({
            where,
            order: { date: 'DESC' },
            relations: ['account', 'category', 'sourceAccount', 'destinationAccount'],
        });
    }

    async findOne(id: string, userId: string) {
        const transaction = await this.transactionRepository.findOne({
            where: { id, userId },
            relations: ['account', 'category', 'sourceAccount', 'destinationAccount'],
        });

        if (!transaction) {
            throw new NotFoundException(`Transaction with ID ${id} not found`);
        }

        return transaction;
    }

    async update(id: string, updateTransactionDto: UpdateTransactionDto, userId: string) {
        const transaction = await this.findOne(id, userId);

        // Instanciar helpers necesarios
        const ownershipValidator = new OwnershipValidator(
            this.accountService,
            this.categoryService,
        );
        const balanceRules = new BalanceRules(this.accountService);
        const updateRules = new UpdateTransactionRules(balanceRules, ownershipValidator);

        // Procesar la actualización de balances
        await updateRules.process(transaction, updateTransactionDto, userId);

        const updatedTransaction = this.transactionRepository.merge(transaction, updateTransactionDto);
        return await this.transactionRepository.save(updatedTransaction);
    }

    async remove(id: string, userId: string) {
        const transaction = await this.findOne(id, userId);

        // TODO: Revertir balance antes de eliminar.

        return await this.transactionRepository.remove(transaction);
    }
}
