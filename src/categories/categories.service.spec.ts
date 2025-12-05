import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoriesService } from './categories.service';
import { Category } from './entities/category.entity';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let repository: Repository<Category>;

  const mockUserId = '550e8400-e29b-41d4-a716-446655440000';
  const mockCategoryId = '770e8400-e29b-41d4-a716-446655440000';

  const mockCategory: Category = {
    id: mockCategoryId,
    name: 'Food',
    transactionType: 'EXPENSE',
    icon: 'fast-food',
    color: '#FF5733',
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
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getRepositoryToken(Category),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    repository = module.get<Repository<Category>>(getRepositoryToken(Category));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an EXPENSE category successfully', async () => {
      const createCategoryDto = {
        name: 'Food',
        transactionType: 'EXPENSE' as const,
        icon: 'fast-food',
        color: '#FF5733',
        userId: mockUserId,
      };

      mockRepository.create.mockReturnValue(mockCategory);
      mockRepository.save.mockResolvedValue(mockCategory);

      const result = await service.create(createCategoryDto);

      expect(mockRepository.create).toHaveBeenCalledWith(createCategoryDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockCategory);
      expect(result).toEqual(mockCategory);
      expect(result.transactionType).toBe('EXPENSE');
    });

    it('should create an INCOME category successfully', async () => {
      const incomeCategory = {
        ...mockCategory,
        transactionType: 'INCOME',
        name: 'Salary',
      };
      const createCategoryDto = {
        name: 'Salary',
        transactionType: 'INCOME' as const,
        userId: mockUserId,
      };

      mockRepository.create.mockReturnValue(incomeCategory);
      mockRepository.save.mockResolvedValue(incomeCategory);

      const result = await service.create(createCategoryDto);

      expect(result.transactionType).toBe('INCOME');
    });

    it('should create category without icon and color', async () => {
      const categoryWithoutOptionals = {
        ...mockCategory,
        icon: null,
        color: null,
      };
      const createCategoryDto = {
        name: 'Basic Category',
        transactionType: 'EXPENSE' as const,
        userId: mockUserId,
      };

      mockRepository.create.mockReturnValue(categoryWithoutOptionals);
      mockRepository.save.mockResolvedValue(categoryWithoutOptionals);

      const result = await service.create(createCategoryDto);

      expect(result.icon).toBeNull();
      expect(result.color).toBeNull();
    });

    it('should handle database error on create', async () => {
      mockRepository.create.mockReturnValue(mockCategory);
      mockRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(
        service.create({ ...mockCategory, userId: mockUserId }),
      ).rejects.toThrow('Database error');
    });
  });

  describe('findByUserId', () => {
    it('should return categories for a user', async () => {
      const categories = [
        mockCategory,
        {
          ...mockCategory,
          id: '2',
          name: 'Transport',
          transactionType: 'EXPENSE',
        },
        { ...mockCategory, id: '3', name: 'Salary', transactionType: 'INCOME' },
      ];
      mockRepository.find.mockResolvedValue(categories);

      const result = await service.findByUserId(mockUserId);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(categories);
      expect(result).toHaveLength(3);
    });

    it('should return empty array when user has no categories', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findByUserId(mockUserId);

      expect(result).toEqual([]);
    });

    it('should filter categories by user correctly', async () => {
      mockRepository.find.mockResolvedValue([mockCategory]);

      await service.findByUserId(mockUserId);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a category by ID', async () => {
      mockRepository.findOne.mockResolvedValue(mockCategory);

      const result = await service.findOne(mockCategoryId);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockCategoryId },
      });
      expect(result).toEqual(mockCategory);
    });

    it('should throw NotFoundException when category not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        'Category with ID non-existent-id not found',
      );
    });
  });

  describe('findOneByUser', () => {
    it('should return category when it belongs to user', async () => {
      mockRepository.findOne.mockResolvedValue(mockCategory);

      const result = await service.findOneByUser(mockCategoryId, mockUserId);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockCategoryId, userId: mockUserId },
      });
      expect(result).toEqual(mockCategory);
    });

    it('should throw NotFoundException when category not found for user', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.findOneByUser(mockCategoryId, 'different-user-id'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateByUser', () => {
    it('should update category when it belongs to user', async () => {
      const updateDto = { name: 'Updated Food' };
      const updatedCategory = { ...mockCategory, name: 'Updated Food' };

      mockRepository.findOne.mockResolvedValue(mockCategory);
      mockRepository.save.mockResolvedValue(updatedCategory);

      const result = await service.updateByUser(
        mockCategoryId,
        mockUserId,
        updateDto,
      );

      expect(result.name).toBe('Updated Food');
    });

    it('should throw ForbiddenException when category belongs to different user', async () => {
      const differentUserCategory = {
        ...mockCategory,
        userId: 'different-user-id',
      };
      mockRepository.findOne.mockResolvedValue(differentUserCategory);

      await expect(
        service.updateByUser(mockCategoryId, mockUserId, { name: 'Test' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when category not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateByUser('non-existent-id', mockUserId, { name: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should update icon and color', async () => {
      const updateDto = { icon: 'new-icon', color: '#00FF00' };
      const updatedCategory = {
        ...mockCategory,
        icon: 'new-icon',
        color: '#00FF00',
      };

      mockRepository.findOne.mockResolvedValue(mockCategory);
      mockRepository.save.mockResolvedValue(updatedCategory);

      const result = await service.updateByUser(
        mockCategoryId,
        mockUserId,
        updateDto,
      );

      expect(result.icon).toBe('new-icon');
      expect(result.color).toBe('#00FF00');
    });

    it('should update transaction type', async () => {
      const updateDto = { transactionType: 'INCOME' };
      const updatedCategory = { ...mockCategory, transactionType: 'INCOME' };

      mockRepository.findOne.mockResolvedValue(mockCategory);
      mockRepository.save.mockResolvedValue(updatedCategory);

      const result = await service.updateByUser(
        mockCategoryId,
        mockUserId,
        updateDto,
      );

      expect(result.transactionType).toBe('INCOME');
    });
  });

  describe('removeByUser', () => {
    it('should remove category when it belongs to user', async () => {
      mockRepository.findOne.mockResolvedValue(mockCategory);
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await service.removeByUser(mockCategoryId, mockUserId);

      expect(mockRepository.delete).toHaveBeenCalledWith(mockCategoryId);
    });

    it('should throw ForbiddenException when category belongs to different user', async () => {
      const differentUserCategory = {
        ...mockCategory,
        userId: 'different-user-id',
      };
      mockRepository.findOne.mockResolvedValue(differentUserCategory);

      await expect(
        service.removeByUser(mockCategoryId, mockUserId),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when category not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.removeByUser('non-existent-id', mockUserId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all categories without filter', async () => {
      const categories = [mockCategory];
      mockRepository.find.mockResolvedValue(categories);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalledWith();
      expect(result).toEqual(categories);
    });

    it('should return categories filtered by userId', async () => {
      mockRepository.find.mockResolvedValue([mockCategory]);

      const result = await service.findAll(mockUserId);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { userId: mockUserId },
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('update (internal)', () => {
    it('should update category without user check', async () => {
      const updateDto = { name: 'Updated' };
      const updatedCategory = { ...mockCategory, name: 'Updated' };

      mockRepository.findOne.mockResolvedValue(mockCategory);
      mockRepository.save.mockResolvedValue(updatedCategory);

      const result = await service.update(mockCategoryId, updateDto);

      expect(result.name).toBe('Updated');
    });
  });

  describe('remove (internal)', () => {
    it('should remove category without user check', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove(mockCategoryId);

      expect(mockRepository.delete).toHaveBeenCalledWith(mockCategoryId);
    });

    it('should throw NotFoundException when delete affects no rows', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('edge cases', () => {
    it('should handle special characters in category name', async () => {
      const createDto = {
        name: 'Food & Drinks <test>',
        transactionType: 'EXPENSE' as const,
        userId: mockUserId,
      };

      const specialCategory = { ...mockCategory, name: createDto.name };
      mockRepository.create.mockReturnValue(specialCategory);
      mockRepository.save.mockResolvedValue(specialCategory);

      const result = await service.create(createDto);

      expect(result.name).toBe('Food & Drinks <test>');
    });

    it('should handle empty string icon', async () => {
      const updateDto = { icon: '' };
      const updatedCategory = { ...mockCategory, icon: '' };

      mockRepository.findOne.mockResolvedValue(mockCategory);
      mockRepository.save.mockResolvedValue(updatedCategory);

      const result = await service.updateByUser(
        mockCategoryId,
        mockUserId,
        updateDto,
      );

      expect(result.icon).toBe('');
    });

    it('should handle invalid color format', async () => {
      // Note: Service doesn't validate color format - potential bug
      const updateDto = { color: 'not-a-color' };
      const updatedCategory = { ...mockCategory, color: 'not-a-color' };

      mockRepository.findOne.mockResolvedValue(mockCategory);
      mockRepository.save.mockResolvedValue(updatedCategory);

      const result = await service.updateByUser(
        mockCategoryId,
        mockUserId,
        updateDto,
      );

      expect(result.color).toBe('not-a-color');
    });

    it('should handle very long category name', async () => {
      const longName = 'A'.repeat(255);
      const createDto = {
        name: longName,
        transactionType: 'EXPENSE' as const,
        userId: mockUserId,
      };

      const longNameCategory = { ...mockCategory, name: longName };
      mockRepository.create.mockReturnValue(longNameCategory);
      mockRepository.save.mockResolvedValue(longNameCategory);

      const result = await service.create(createDto);

      expect(result.name).toHaveLength(255);
    });
  });
});
