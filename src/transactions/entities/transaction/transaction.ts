import { Account } from 'src/accounts/entities/account.entity';
import { CategoriesController } from 'src/categories/categories.controller';
import { Category } from 'src/categories/entities/category.entity';
import { User } from 'src/users/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('transactions')
export class Transaction {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 20 })
    type: string;

    @Column('decimal', { precision: 10, scale: 2 })
    amount: number;

    @Column({ type: 'timestamp' })
    date: Date;

    @Column({ nullable: true })
    description: string;

    @Column({ length: 20, default: 'MANUAL' })
    origin: string; // 'MANUAL' | 'RECEIPT_AI' | 'IMPORT'

    @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ name: 'user_id' })
    userId: string;

    @ManyToOne(() => Account, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'account_id' })
    account: Account;

    @Column({ name: 'account_id', nullable: true })
    accountId?: string;

    @ManyToOne(() => Category, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'category_id' })
    category: Category;

    @Column({ name: 'category_id', nullable: true })
    categoryId?: string;

    @ManyToOne(() => Account, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'source_account_id' })
    sourceAccount: Account;

    @Column({ name: 'source_account_id', nullable: true })
    sourceAccountId?: string;

    @ManyToOne(() => Account, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'destination_account_id' })
    destinationAccount: Account;

    @Column({ name: 'destination_account_id', nullable: true })
    destinationAccountId?: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

}
