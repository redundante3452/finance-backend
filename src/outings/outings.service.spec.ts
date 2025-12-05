import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { OutingsService } from './outings.service';
import { Outing } from './entities/outing.entity';
import { Participant } from './entities/participant.entity';
import { OutingAccount } from './entities/outing-account.entity';
import { Product } from './entities/product.entity';
import { Payer } from './entities/payer.entity';
import { NotFoundException } from '@nestjs/common';

describe('OutingsService', () => {
  let service: OutingsService;
  let outingRepo: Repository<Outing>;
  let participantRepo: Repository<Participant>;
  let productRepo: Repository<Product>;
  let dataSource: DataSource;

  const mockOutingId = 'outing-1';
  const mockUserId = 'user-1';

  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
  };

  const mockDataSource = {
    getRepository: jest.fn().mockReturnValue({
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OutingsService,
        { provide: getRepositoryToken(Outing), useClass: Repository },
        { provide: getRepositoryToken(Participant), useClass: Repository },
        { provide: getRepositoryToken(OutingAccount), useClass: Repository },
        { provide: getRepositoryToken(Product), useClass: Repository },
        { provide: getRepositoryToken(Payer), useClass: Repository },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<OutingsService>(OutingsService);
    outingRepo = module.get(getRepositoryToken(Outing));
    participantRepo = module.get(getRepositoryToken(Participant));
    productRepo = module.get(getRepositoryToken(Product));
    dataSource = module.get(DataSource);
  });

  describe('createOuting', () => {
    it('should create an outing', async () => {
      const dto = { name: 'Friday Night' };
      const outing = { id: mockOutingId, ...dto, userId: mockUserId };

      jest.spyOn(outingRepo, 'create').mockReturnValue(outing as any);
      jest.spyOn(outingRepo, 'save').mockResolvedValue(outing as any);

      const result = await service.createOuting(dto, mockUserId);
      expect(result).toEqual(outing);
      expect(outingRepo.create).toHaveBeenCalledWith({
        ...dto,
        userId: mockUserId,
      });
    });
  });

  describe('addParticipant', () => {
    it('should add a participant', async () => {
      const dto = { name: 'Juan' };
      const participant = { id: 'p1', ...dto, outingId: mockOutingId };

      jest.spyOn(participantRepo, 'create').mockReturnValue(participant as any);
      jest.spyOn(participantRepo, 'save').mockResolvedValue(participant as any);

      const result = await service.addParticipant(mockOutingId, dto);
      expect(result).toEqual(participant);
    });
  });

  describe('addProduct', () => {
    it('should add a new product', async () => {
      const dto = {
        name: 'Beer',
        price: 5000,
        quantity: 1,
        participantId: 'p1',
      };
      const product = { id: 'prod1', ...dto, accountId: 'acc1' };

      jest.spyOn(productRepo, 'findOne').mockResolvedValue(null);
      jest.spyOn(productRepo, 'create').mockReturnValue(product as any);
      jest.spyOn(productRepo, 'save').mockResolvedValue(product as any);

      const result = await service.addProduct('acc1', dto);
      expect(result).toEqual(product);
    });

    it('should increment quantity if product exists', async () => {
      const dto = {
        name: 'Beer',
        price: 5000,
        quantity: 1,
        participantId: 'p1',
      };
      const existingProduct = {
        id: 'prod1',
        ...dto,
        accountId: 'acc1',
        quantity: 2,
      };
      const updatedProduct = { ...existingProduct, quantity: 3 };

      jest
        .spyOn(productRepo, 'findOne')
        .mockResolvedValue(existingProduct as any);
      jest.spyOn(productRepo, 'save').mockResolvedValue(updatedProduct as any);
      const createSpy = jest.spyOn(productRepo, 'create'); // Spy on create

      const result = await service.addProduct('acc1', dto);
      expect(result.quantity).toBe(3);
      expect(createSpy).not.toHaveBeenCalled();
    });
  });

  describe('calculateDebts', () => {
    it('should throw NotFoundException if outing not found', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(null);
      await expect(service.calculateDebts('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return calculation result', async () => {
      const outing = {
        id: mockOutingId,
        participants: [],
        accounts: [],
      };
      mockQueryBuilder.getOne.mockResolvedValue(outing);

      const result = await service.calculateDebts(mockOutingId);
      expect(result).toHaveProperty('balances');
      expect(result).toHaveProperty('debts');
    });
  });
});
