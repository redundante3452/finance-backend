import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { JwtService } from '@nestjs/jwt';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let service: CategoriesService;

  const mockUserId = '550e8400-e29b-41d4-a716-446655440000';
  const mockCategoryId = '770e8400-e29b-41d4-a716-446655440000';

  const mockCategory = {
    id: mockCategoryId,
    name: 'Food',
    transactionType: 'EXPENSE',
    icon: 'fast-food',
    color: '#FF5733',
    userId: mockUserId,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockCategoriesService = {
    create: jest.fn(),
    findByUserId: jest.fn(),
    findOneByUser: jest.fn(),
    updateByUser: jest.fn(),
    removeByUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoriesService,
          useValue: mockCategoriesService,
        },
        {
          provide: JwtService,
          useValue: { verifyAsync: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
    service = module.get<CategoriesService>(CategoriesService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an EXPENSE category', async () => {
      const createDto = {
        name: 'Food',
        transactionType: 'EXPENSE' as const,
        icon: 'fast-food',
        color: '#FF5733',
      };

      mockCategoriesService.create.mockResolvedValue(mockCategory);

      const result = await controller.create(mockUserId, createDto);

      expect(result).toEqual(mockCategory);
      expect(mockCategoriesService.create).toHaveBeenCalledWith({
        ...createDto,
        userId: mockUserId,
      });
    });

    it('should create an INCOME category', async () => {
      const createDto = {
        name: 'Salary',
        transactionType: 'INCOME' as const,
      };

      const incomeCategory = {
        ...mockCategory,
        name: 'Salary',
        transactionType: 'INCOME',
      };
      mockCategoriesService.create.mockResolvedValue(incomeCategory);

      const result = await controller.create(mockUserId, createDto);

      expect(result.transactionType).toBe('INCOME');
    });
  });

  describe('findAll', () => {
    it('should return all categories for user', async () => {
      const categories = [mockCategory];
      mockCategoriesService.findByUserId.mockResolvedValue(categories);

      const result = await controller.findAll(mockUserId);

      expect(result).toEqual(categories);
      expect(mockCategoriesService.findByUserId).toHaveBeenCalledWith(
        mockUserId,
      );
    });

    it('should return empty array when no categories', async () => {
      mockCategoriesService.findByUserId.mockResolvedValue([]);

      const result = await controller.findAll(mockUserId);

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return specific category', async () => {
      mockCategoriesService.findOneByUser.mockResolvedValue(mockCategory);

      const result = await controller.findOne(mockUserId, mockCategoryId);

      expect(result).toEqual(mockCategory);
      expect(mockCategoriesService.findOneByUser).toHaveBeenCalledWith(
        mockCategoryId,
        mockUserId,
      );
    });

    it('should propagate NotFoundException', async () => {
      mockCategoriesService.findOneByUser.mockRejectedValue(
        new NotFoundException(),
      );

      await expect(
        controller.findOne(mockUserId, 'non-existent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update category', async () => {
      const updateDto = { name: 'Updated Food' };
      const updatedCategory = { ...mockCategory, name: 'Updated Food' };

      mockCategoriesService.updateByUser.mockResolvedValue(updatedCategory);

      const result = await controller.update(
        mockUserId,
        mockCategoryId,
        updateDto,
      );

      expect(result.name).toBe('Updated Food');
      expect(mockCategoriesService.updateByUser).toHaveBeenCalledWith(
        mockCategoryId,
        mockUserId,
        updateDto,
      );
    });

    it('should propagate ForbiddenException', async () => {
      mockCategoriesService.updateByUser.mockRejectedValue(
        new ForbiddenException(),
      );

      await expect(
        controller.update(mockUserId, mockCategoryId, { name: 'Test' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should remove category', async () => {
      mockCategoriesService.removeByUser.mockResolvedValue(undefined);

      await controller.remove(mockUserId, mockCategoryId);

      expect(mockCategoriesService.removeByUser).toHaveBeenCalledWith(
        mockCategoryId,
        mockUserId,
      );
    });

    it('should propagate ForbiddenException', async () => {
      mockCategoriesService.removeByUser.mockRejectedValue(
        new ForbiddenException(),
      );

      await expect(
        controller.remove(mockUserId, mockCategoryId),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
