import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountsService } from './accounts.service';
import { Account } from './entities/account.entity';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('AccountsService', () => {
  let service: AccountsService;
  let repository: Repository<Account>;

  const mockUserId = '550e8400-e29b-41d4-a716-446655440000';
  const mockAccountId = '660e8400-e29b-41d4-a716-446655440000';

  const mockAccount: Account = {
    id: mockAccountId,
    name: 'Main Wallet',
    type: 'CASH',
    balance: 1000,
    currency: 'COP',
    userId: mockUserId,
    user: null as any,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    merge: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountsService,
        {
          provide: getRepositoryToken(Account),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<AccountsService>(AccountsService);
    repository = module.get<Repository<Account>>(getRepositoryToken(Account));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an account successfully', async () => {
      const createAccountDto = {
        name: 'Main Wallet',
        type: 'CASH',
        balance: 1000,
        currency: 'COP',
        userId: mockUserId,
      };

      mockRepository.create.mockReturnValue(mockAccount);
      mockRepository.save.mockResolvedValue(mockAccount);

      const result = await service.create(createAccountDto);

      expect(mockRepository.create).toHaveBeenCalledWith(createAccountDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockAccount);
      expect(result).toEqual(mockAccount);
    });

    it('should create account with default balance of 0', async () => {
      const createAccountDto = {
        name: 'Empty Wallet',
        type: 'CASH',
        userId: mockUserId,
      };

      const accountWithDefaultBalance = { ...mockAccount, balance: 0 };
      mockRepository.create.mockReturnValue(accountWithDefaultBalance);
      mockRepository.save.mockResolvedValue(accountWithDefaultBalance);

      const result = await service.create(createAccountDto);

      expect(result.balance).toBe(0);
    });

    it('should handle database error on create', async () => {
      mockRepository.create.mockReturnValue(mockAccount);
      mockRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(
        service.create({ ...mockAccount, userId: mockUserId }),
      ).rejects.toThrow('Database error');
    });
  });

  describe('findByUserId', () => {
    it('should return accounts for a user', async () => {
      const accounts = [
        mockAccount,
        { ...mockAccount, id: '2', name: 'Bank Account' },
      ];
      mockRepository.find.mockResolvedValue(accounts);

      const result = await service.findByUserId(mockUserId);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(accounts);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when user has no accounts', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findByUserId(mockUserId);

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return an account by ID', async () => {
      mockRepository.findOne.mockResolvedValue(mockAccount);

      const result = await service.findOne(mockAccountId);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockAccountId },
      });
      expect(result).toEqual(mockAccount);
    });

    it('should throw NotFoundException when account not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        'Account with ID non-existent-id not found',
      );
    });
  });

  describe('findOneByUser', () => {
    it('should return account when it belongs to user', async () => {
      mockRepository.findOne.mockResolvedValue(mockAccount);

      const result = await service.findOneByUser(mockAccountId, mockUserId);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockAccountId, userId: mockUserId },
      });
      expect(result).toEqual(mockAccount);
    });

    it('should throw NotFoundException when account not found for user', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.findOneByUser(mockAccountId, 'different-user-id'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateByUser', () => {
    it('should update account when it belongs to user', async () => {
      const updateDto = { name: 'Updated Wallet' };
      const updatedAccount = { ...mockAccount, name: 'Updated Wallet' };

      mockRepository.findOne.mockResolvedValue(mockAccount);
      mockRepository.merge.mockReturnValue(updatedAccount);
      mockRepository.save.mockResolvedValue(updatedAccount);

      const result = await service.updateByUser(
        mockAccountId,
        mockUserId,
        updateDto,
      );

      expect(mockRepository.merge).toHaveBeenCalledWith(mockAccount, updateDto);
      expect(result.name).toBe('Updated Wallet');
    });

    it('should throw ForbiddenException when account belongs to different user', async () => {
      const differentUserAccount = {
        ...mockAccount,
        userId: 'different-user-id',
      };
      mockRepository.findOne.mockResolvedValue(differentUserAccount);

      await expect(
        service.updateByUser(mockAccountId, mockUserId, { name: 'Test' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when account not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateByUser('non-existent-id', mockUserId, { name: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should update balance correctly', async () => {
      const updateDto = { balance: 5000 };
      const updatedAccount = { ...mockAccount, balance: 5000 };

      mockRepository.findOne.mockResolvedValue(mockAccount);
      mockRepository.merge.mockReturnValue(updatedAccount);
      mockRepository.save.mockResolvedValue(updatedAccount);

      const result = await service.updateByUser(
        mockAccountId,
        mockUserId,
        updateDto,
      );

      expect(result.balance).toBe(5000);
    });
  });

  describe('removeByUser', () => {
    it('should remove account when it belongs to user', async () => {
      mockRepository.findOne.mockResolvedValue(mockAccount);
      mockRepository.remove.mockResolvedValue(mockAccount);

      await service.removeByUser(mockAccountId, mockUserId);

      expect(mockRepository.remove).toHaveBeenCalledWith(mockAccount);
    });

    it('should throw ForbiddenException when account belongs to different user', async () => {
      const differentUserAccount = {
        ...mockAccount,
        userId: 'different-user-id',
      };
      mockRepository.findOne.mockResolvedValue(differentUserAccount);

      await expect(
        service.removeByUser(mockAccountId, mockUserId),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when account not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.removeByUser('non-existent-id', mockUserId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all accounts with user relations', async () => {
      const accounts = [mockAccount];
      mockRepository.find.mockResolvedValue(accounts);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalledWith({ relations: ['user'] });
      expect(result).toEqual(accounts);
    });

    it('should throw NotFoundException when no accounts found', async () => {
      mockRepository.find.mockResolvedValue([]);

      await expect(service.findAll()).rejects.toThrow(NotFoundException);
      await expect(service.findAll()).rejects.toThrow('No accounts found');
    });
  });

  describe('update (internal)', () => {
    it('should update account without user check', async () => {
      const updateDto = { balance: 2000 };
      const updatedAccount = { ...mockAccount, balance: 2000 };

      mockRepository.findOne.mockResolvedValue(mockAccount);
      mockRepository.merge.mockReturnValue(updatedAccount);
      mockRepository.save.mockResolvedValue(updatedAccount);

      const result = await service.update(mockAccountId, updateDto);

      expect(result.balance).toBe(2000);
    });
  });

  describe('remove (internal)', () => {
    it('should remove account without user check', async () => {
      mockRepository.findOne.mockResolvedValue(mockAccount);
      mockRepository.remove.mockResolvedValue(mockAccount);

      await service.remove(mockAccountId);

      expect(mockRepository.remove).toHaveBeenCalledWith(mockAccount);
    });
  });

  describe('edge cases', () => {
    it('should handle negative balance update', async () => {
      const updateDto = { balance: -100 };
      const updatedAccount = { ...mockAccount, balance: -100 };

      mockRepository.findOne.mockResolvedValue(mockAccount);
      mockRepository.merge.mockReturnValue(updatedAccount);
      mockRepository.save.mockResolvedValue(updatedAccount);

      const result = await service.updateByUser(
        mockAccountId,
        mockUserId,
        updateDto,
      );

      // Note: The service doesn't validate negative balance - this might be a bug to fix
      expect(result.balance).toBe(-100);
    });

    it('should handle very large balance', async () => {
      const updateDto = { balance: 99999999.99 };
      const updatedAccount = { ...mockAccount, balance: 99999999.99 };

      mockRepository.findOne.mockResolvedValue(mockAccount);
      mockRepository.merge.mockReturnValue(updatedAccount);
      mockRepository.save.mockResolvedValue(updatedAccount);

      const result = await service.updateByUser(
        mockAccountId,
        mockUserId,
        updateDto,
      );

      expect(result.balance).toBe(99999999.99);
    });

    it('should handle special characters in account name', async () => {
      const createDto = {
        name: "John's Wallet <test> & more",
        type: 'CASH',
        userId: mockUserId,
      };

      const specialAccount = { ...mockAccount, name: createDto.name };
      mockRepository.create.mockReturnValue(specialAccount);
      mockRepository.save.mockResolvedValue(specialAccount);

      const result = await service.create(createDto);

      expect(result.name).toBe("John's Wallet <test> & more");
    });
  });
});
