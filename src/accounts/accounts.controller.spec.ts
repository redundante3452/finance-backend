import { Test, TestingModule } from '@nestjs/testing';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
import { JwtService } from '@nestjs/jwt';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('AccountsController', () => {
  let controller: AccountsController;
  let service: AccountsService;

  const mockUserId = '550e8400-e29b-41d4-a716-446655440000';
  const mockAccountId = '660e8400-e29b-41d4-a716-446655440000';

  const mockAccount = {
    id: mockAccountId,
    name: 'Main Wallet',
    type: 'CASH',
    balance: 1000,
    currency: 'COP',
    userId: mockUserId,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockAccountsService = {
    create: jest.fn(),
    findByUserId: jest.fn(),
    findOneByUser: jest.fn(),
    updateByUser: jest.fn(),
    removeByUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountsController],
      providers: [
        {
          provide: AccountsService,
          useValue: mockAccountsService,
        },
        {
          provide: JwtService,
          useValue: { verifyAsync: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<AccountsController>(AccountsController);
    service = module.get<AccountsService>(AccountsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an account', async () => {
      const createDto = {
        name: 'Main Wallet',
        type: 'CASH',
        balance: 1000,
      };

      mockAccountsService.create.mockResolvedValue(mockAccount);

      const result = await controller.create(mockUserId, createDto);

      expect(result).toEqual(mockAccount);
      expect(mockAccountsService.create).toHaveBeenCalledWith({
        ...createDto,
        userId: mockUserId,
      });
    });
  });

  describe('findAll', () => {
    it('should return all accounts for user', async () => {
      const accounts = [mockAccount];
      mockAccountsService.findByUserId.mockResolvedValue(accounts);

      const result = await controller.findAll(mockUserId);

      expect(result).toEqual(accounts);
      expect(mockAccountsService.findByUserId).toHaveBeenCalledWith(mockUserId);
    });

    it('should return empty array when no accounts', async () => {
      mockAccountsService.findByUserId.mockResolvedValue([]);

      const result = await controller.findAll(mockUserId);

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return specific account', async () => {
      mockAccountsService.findOneByUser.mockResolvedValue(mockAccount);

      const result = await controller.findOne(mockUserId, mockAccountId);

      expect(result).toEqual(mockAccount);
      expect(mockAccountsService.findOneByUser).toHaveBeenCalledWith(
        mockAccountId,
        mockUserId,
      );
    });

    it('should propagate NotFoundException', async () => {
      mockAccountsService.findOneByUser.mockRejectedValue(
        new NotFoundException(),
      );

      await expect(
        controller.findOne(mockUserId, 'non-existent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update account', async () => {
      const updateDto = { name: 'Updated Wallet' };
      const updatedAccount = { ...mockAccount, name: 'Updated Wallet' };

      mockAccountsService.updateByUser.mockResolvedValue(updatedAccount);

      const result = await controller.update(
        mockUserId,
        mockAccountId,
        updateDto,
      );

      expect(result.name).toBe('Updated Wallet');
      expect(mockAccountsService.updateByUser).toHaveBeenCalledWith(
        mockAccountId,
        mockUserId,
        updateDto,
      );
    });

    it('should propagate ForbiddenException', async () => {
      mockAccountsService.updateByUser.mockRejectedValue(
        new ForbiddenException(),
      );

      await expect(
        controller.update(mockUserId, mockAccountId, { name: 'Test' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should remove account', async () => {
      mockAccountsService.removeByUser.mockResolvedValue(undefined);

      await controller.remove(mockUserId, mockAccountId);

      expect(mockAccountsService.removeByUser).toHaveBeenCalledWith(
        mockAccountId,
        mockUserId,
      );
    });

    it('should propagate ForbiddenException', async () => {
      mockAccountsService.removeByUser.mockRejectedValue(
        new ForbiddenException(),
      );

      await expect(
        controller.remove(mockUserId, mockAccountId),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
