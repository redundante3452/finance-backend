import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { JwtService } from '@nestjs/jwt';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('TransactionsController', () => {
  let controller: TransactionsController;
  let service: TransactionsService;

  const mockUserId = '550e8400-e29b-41d4-a716-446655440000';
  const mockTransactionId = '880e8400-e29b-41d4-a716-446655440000';
  const mockAccountId = '660e8400-e29b-41d4-a716-446655440000';
  const mockCategoryId = '770e8400-e29b-41d4-a716-446655440000';

  const mockTransaction = {
    id: mockTransactionId,
    type: 'EXPENSE',
    amount: 100,
    date: new Date('2024-01-15'),
    description: 'Lunch',
    origin: 'MANUAL',
    userId: mockUserId,
    accountId: mockAccountId,
    categoryId: mockCategoryId,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  };

  const mockTransactionsService = {
    createTransaction: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [
        {
          provide: TransactionsService,
          useValue: mockTransactionsService,
        },
        {
          provide: JwtService,
          useValue: { verifyAsync: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<TransactionsController>(TransactionsController);
    service = module.get<TransactionsService>(TransactionsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an EXPENSE transaction', async () => {
      const createDto = {
        type: 'EXPENSE' as const,
        amount: 100,
        accountId: mockAccountId,
        categoryId: mockCategoryId,
        description: 'Lunch',
      };

      mockTransactionsService.createTransaction.mockResolvedValue(
        mockTransaction,
      );

      const result = await controller.create(mockUserId, createDto);

      expect(result).toEqual(mockTransaction);
      expect(mockTransactionsService.createTransaction).toHaveBeenCalledWith(
        createDto,
        mockUserId,
      );
    });

    it('should create an INCOME transaction', async () => {
      const createDto = {
        type: 'INCOME' as const,
        amount: 500,
        accountId: mockAccountId,
        categoryId: mockCategoryId,
        description: 'Salary',
      };

      const incomeTransaction = {
        ...mockTransaction,
        type: 'INCOME',
        amount: 500,
      };
      mockTransactionsService.createTransaction.mockResolvedValue(
        incomeTransaction,
      );

      const result = await controller.create(mockUserId, createDto);

      expect(result.type).toBe('INCOME');
    });

    it('should create a TRANSFER transaction', async () => {
      const createDto = {
        type: 'TRANSFER' as const,
        amount: 200,
        sourceAccountId: mockAccountId,
        destinationAccountId: '660e8400-e29b-41d4-a716-446655440001',
        description: 'Transfer to savings',
      };

      const transferTransaction = { ...mockTransaction, type: 'TRANSFER' };
      mockTransactionsService.createTransaction.mockResolvedValue(
        transferTransaction,
      );

      const result = await controller.create(mockUserId, createDto);

      expect(result.type).toBe('TRANSFER');
    });

    it('should propagate BadRequestException for insufficient balance', async () => {
      const createDto = {
        type: 'EXPENSE' as const,
        amount: 10000,
        accountId: mockAccountId,
        categoryId: mockCategoryId,
      };

      mockTransactionsService.createTransaction.mockRejectedValue(
        new BadRequestException('Insufficient balance'),
      );

      await expect(controller.create(mockUserId, createDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all transactions for user', async () => {
      const transactions = [mockTransaction];
      mockTransactionsService.findAll.mockResolvedValue(transactions);

      const result = await controller.findAll(mockUserId, {});

      expect(result).toEqual(transactions);
      expect(mockTransactionsService.findAll).toHaveBeenCalledWith(
        {},
        mockUserId,
      );
    });

    it('should pass filter parameters', async () => {
      const filterDto = {
        type: 'EXPENSE' as const,
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        accountId: mockAccountId,
        categoryId: mockCategoryId,
      };

      mockTransactionsService.findAll.mockResolvedValue([mockTransaction]);

      await controller.findAll(mockUserId, filterDto);

      expect(mockTransactionsService.findAll).toHaveBeenCalledWith(
        filterDto,
        mockUserId,
      );
    });

    it('should return empty array when no transactions', async () => {
      mockTransactionsService.findAll.mockResolvedValue([]);

      const result = await controller.findAll(mockUserId, {});

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return specific transaction', async () => {
      mockTransactionsService.findOne.mockResolvedValue(mockTransaction);

      const result = await controller.findOne(mockUserId, mockTransactionId);

      expect(result).toEqual(mockTransaction);
      expect(mockTransactionsService.findOne).toHaveBeenCalledWith(
        mockTransactionId,
        mockUserId,
      );
    });

    it('should propagate NotFoundException', async () => {
      mockTransactionsService.findOne.mockRejectedValue(
        new NotFoundException(),
      );

      await expect(
        controller.findOne(mockUserId, 'non-existent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update transaction', async () => {
      const updateDto = { description: 'Updated description' };
      const updatedTransaction = {
        ...mockTransaction,
        description: 'Updated description',
      };

      mockTransactionsService.update.mockResolvedValue(updatedTransaction);

      const result = await controller.update(
        mockUserId,
        mockTransactionId,
        updateDto,
      );

      expect(result.description).toBe('Updated description');
      expect(mockTransactionsService.update).toHaveBeenCalledWith(
        mockTransactionId,
        updateDto,
        mockUserId,
      );
    });

    it('should propagate NotFoundException', async () => {
      mockTransactionsService.update.mockRejectedValue(new NotFoundException());

      await expect(
        controller.update(mockUserId, 'non-existent', { description: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove transaction', async () => {
      mockTransactionsService.remove.mockResolvedValue(mockTransaction);

      const result = await controller.remove(mockUserId, mockTransactionId);

      expect(result).toEqual(mockTransaction);
      expect(mockTransactionsService.remove).toHaveBeenCalledWith(
        mockTransactionId,
        mockUserId,
      );
    });

    it('should propagate NotFoundException', async () => {
      mockTransactionsService.remove.mockRejectedValue(new NotFoundException());

      await expect(
        controller.remove(mockUserId, 'non-existent'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
