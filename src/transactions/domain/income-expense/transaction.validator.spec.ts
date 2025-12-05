import { BadRequestException } from '@nestjs/common';
import { TransactionValidator } from './transaction.validator';
import { Transaction } from '../../entities/transaction/transaction.entity';

describe('TransactionValidator', () => {
  let validator: TransactionValidator;

  beforeEach(() => {
    validator = new TransactionValidator();
  });

  const createMockTransaction = (
    overrides: Partial<Transaction> = {},
  ): Transaction => ({
    id: '880e8400-e29b-41d4-a716-446655440000',
    type: 'EXPENSE',
    amount: 100,
    date: new Date('2024-01-15'),
    description: 'Test transaction',
    origin: 'MANUAL',
    userId: '550e8400-e29b-41d4-a716-446655440000',
    accountId: '660e8400-e29b-41d4-a716-446655440000',
    categoryId: '770e8400-e29b-41d4-a716-446655440000',
    sourceAccountId: null,
    destinationAccountId: null,
    user: null as any,
    account: null as any,
    category: null as any,
    sourceAccount: null as any,
    destinationAccount: null as any,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    ...overrides,
  });

  describe('validateTypeAndRequiredFields', () => {
    describe('valid transactions', () => {
      it('should pass for valid INCOME transaction', () => {
        const transaction = createMockTransaction({
          type: 'INCOME',
          accountId: '660e8400-e29b-41d4-a716-446655440000',
          categoryId: '770e8400-e29b-41d4-a716-446655440000',
        });

        expect(() =>
          validator.validateTypeAndRequiredFields(transaction),
        ).not.toThrow();
      });

      it('should pass for valid EXPENSE transaction', () => {
        const transaction = createMockTransaction({
          type: 'EXPENSE',
          accountId: '660e8400-e29b-41d4-a716-446655440000',
          categoryId: '770e8400-e29b-41d4-a716-446655440000',
        });

        expect(() =>
          validator.validateTypeAndRequiredFields(transaction),
        ).not.toThrow();
      });

      it('should pass for valid TRANSFER transaction', () => {
        const transaction = createMockTransaction({
          type: 'TRANSFER',
          accountId: null,
          categoryId: null,
          sourceAccountId: '660e8400-e29b-41d4-a716-446655440000',
          destinationAccountId: '660e8400-e29b-41d4-a716-446655440001',
        });

        expect(() =>
          validator.validateTypeAndRequiredFields(transaction),
        ).not.toThrow();
      });
    });

    describe('invalid transaction types', () => {
      it('should throw BadRequestException for invalid type', () => {
        const transaction = createMockTransaction({ type: 'INVALID' as any });

        expect(() =>
          validator.validateTypeAndRequiredFields(transaction),
        ).toThrow(BadRequestException);
        expect(() =>
          validator.validateTypeAndRequiredFields(transaction),
        ).toThrow('Transaction type must be INCOME or EXPENSE or TRANSFER');
      });

      it('should throw BadRequestException for empty type', () => {
        const transaction = createMockTransaction({ type: '' as any });

        expect(() =>
          validator.validateTypeAndRequiredFields(transaction),
        ).toThrow(BadRequestException);
      });

      it('should throw BadRequestException for lowercase type', () => {
        const transaction = createMockTransaction({ type: 'income' as any });

        expect(() =>
          validator.validateTypeAndRequiredFields(transaction),
        ).toThrow(BadRequestException);
      });

      it('should throw BadRequestException for null type', () => {
        const transaction = createMockTransaction({ type: null as any });

        expect(() =>
          validator.validateTypeAndRequiredFields(transaction),
        ).toThrow(BadRequestException);
      });

      it('should throw BadRequestException for undefined type', () => {
        const transaction = createMockTransaction({ type: undefined as any });

        expect(() =>
          validator.validateTypeAndRequiredFields(transaction),
        ).toThrow(BadRequestException);
      });
    });

    describe('INCOME/EXPENSE required fields', () => {
      it('should throw BadRequestException when accountId is missing for INCOME', () => {
        const transaction = createMockTransaction({
          type: 'INCOME',
          accountId: null,
          categoryId: '770e8400-e29b-41d4-a716-446655440000',
        });

        expect(() =>
          validator.validateTypeAndRequiredFields(transaction),
        ).toThrow(BadRequestException);
        expect(() =>
          validator.validateTypeAndRequiredFields(transaction),
        ).toThrow('Transaction account and category are required');
      });

      it('should throw BadRequestException when categoryId is missing for INCOME', () => {
        const transaction = createMockTransaction({
          type: 'INCOME',
          accountId: '660e8400-e29b-41d4-a716-446655440000',
          categoryId: null,
        });

        expect(() =>
          validator.validateTypeAndRequiredFields(transaction),
        ).toThrow(BadRequestException);
      });

      it('should throw BadRequestException when accountId is missing for EXPENSE', () => {
        const transaction = createMockTransaction({
          type: 'EXPENSE',
          accountId: null,
          categoryId: '770e8400-e29b-41d4-a716-446655440000',
        });

        expect(() =>
          validator.validateTypeAndRequiredFields(transaction),
        ).toThrow(BadRequestException);
      });

      it('should throw BadRequestException when categoryId is missing for EXPENSE', () => {
        const transaction = createMockTransaction({
          type: 'EXPENSE',
          accountId: '660e8400-e29b-41d4-a716-446655440000',
          categoryId: null,
        });

        expect(() =>
          validator.validateTypeAndRequiredFields(transaction),
        ).toThrow(BadRequestException);
      });

      it('should throw BadRequestException when both accountId and categoryId are missing', () => {
        const transaction = createMockTransaction({
          type: 'EXPENSE',
          accountId: null,
          categoryId: null,
        });

        expect(() =>
          validator.validateTypeAndRequiredFields(transaction),
        ).toThrow(BadRequestException);
      });
    });

    describe('TRANSFER required fields', () => {
      it('should throw BadRequestException when sourceAccountId is missing for TRANSFER', () => {
        const transaction = createMockTransaction({
          type: 'TRANSFER',
          accountId: null,
          categoryId: null,
          sourceAccountId: null,
          destinationAccountId: '660e8400-e29b-41d4-a716-446655440001',
        });

        expect(() =>
          validator.validateTypeAndRequiredFields(transaction),
        ).toThrow(BadRequestException);
        expect(() =>
          validator.validateTypeAndRequiredFields(transaction),
        ).toThrow('Transaction source and destination accounts are required');
      });

      it('should throw BadRequestException when destinationAccountId is missing for TRANSFER', () => {
        const transaction = createMockTransaction({
          type: 'TRANSFER',
          accountId: null,
          categoryId: null,
          sourceAccountId: '660e8400-e29b-41d4-a716-446655440000',
          destinationAccountId: null,
        });

        expect(() =>
          validator.validateTypeAndRequiredFields(transaction),
        ).toThrow(BadRequestException);
      });

      it('should throw BadRequestException when both source and destination are missing for TRANSFER', () => {
        const transaction = createMockTransaction({
          type: 'TRANSFER',
          accountId: null,
          categoryId: null,
          sourceAccountId: null,
          destinationAccountId: null,
        });

        expect(() =>
          validator.validateTypeAndRequiredFields(transaction),
        ).toThrow(BadRequestException);
      });
    });

    describe('edge cases', () => {
      it('should handle empty string accountId as falsy', () => {
        const transaction = createMockTransaction({
          type: 'EXPENSE',
          accountId: '' as any,
          categoryId: '770e8400-e29b-41d4-a716-446655440000',
        });

        expect(() =>
          validator.validateTypeAndRequiredFields(transaction),
        ).toThrow(BadRequestException);
      });

      it('should handle empty string categoryId as falsy', () => {
        const transaction = createMockTransaction({
          type: 'EXPENSE',
          accountId: '660e8400-e29b-41d4-a716-446655440000',
          categoryId: '' as any,
        });

        expect(() =>
          validator.validateTypeAndRequiredFields(transaction),
        ).toThrow(BadRequestException);
      });

      it('should handle undefined accountId', () => {
        const transaction = createMockTransaction({
          type: 'EXPENSE',
          accountId: undefined as any,
          categoryId: '770e8400-e29b-41d4-a716-446655440000',
        });

        expect(() =>
          validator.validateTypeAndRequiredFields(transaction),
        ).toThrow(BadRequestException);
      });

      it('should not validate amount (done elsewhere)', () => {
        const transaction = createMockTransaction({
          type: 'EXPENSE',
          amount: -100, // Invalid but not checked by this validator
        });

        expect(() =>
          validator.validateTypeAndRequiredFields(transaction),
        ).not.toThrow();
      });

      it('should not require accountId/categoryId for TRANSFER', () => {
        const transaction = createMockTransaction({
          type: 'TRANSFER',
          accountId: null,
          categoryId: null,
          sourceAccountId: '660e8400-e29b-41d4-a716-446655440000',
          destinationAccountId: '660e8400-e29b-41d4-a716-446655440001',
        });

        expect(() =>
          validator.validateTypeAndRequiredFields(transaction),
        ).not.toThrow();
      });
    });
  });
});
