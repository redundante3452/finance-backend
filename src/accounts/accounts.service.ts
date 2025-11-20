import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { Account } from './entities/account.entity';

@Injectable()
export class AccountsService {
    constructor(
        @InjectRepository(Account)
        private readonly accountRepository: Repository<Account>,
    ) { }

    async create(createAccountDto: CreateAccountDto): Promise<Account> {
        const account = this.accountRepository.create(createAccountDto);
        return await this.accountRepository.save(account);
    }

    async findAll(): Promise<Account[]> {
        const accounts = await this.accountRepository.find({ relations: ['user'] });
        if (accounts.length === 0) {
            throw new NotFoundException('No accounts found');
        }
        return accounts;
    }

    async findOne(id: string): Promise<Account> {
        const account = await this.accountRepository.findOne({
            where: { id },
            relations: ['user']
        });
        if (!account) {
            throw new NotFoundException(`Account with ID ${id} not found`);
        }
        return account;
    }

    async update(id: string, updateAccountDto: UpdateAccountDto): Promise<Account> {
        const account = await this.findOne(id);
        this.accountRepository.merge(account, updateAccountDto);
        return await this.accountRepository.save(account);
    }

    async remove(id: string): Promise<void> {
        const account = await this.findOne(id);
        await this.accountRepository.remove(account);
    }
}
