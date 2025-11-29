import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
    constructor(
        @InjectRepository(Category)
        private readonly categoryRepository: Repository<Category>,
    ) { }

    async create(createCategoryDto: CreateCategoryDto & { userId: string }): Promise<Category> {
        const category = this.categoryRepository.create(createCategoryDto);
        return await this.categoryRepository.save(category);
    }

    async findByUserId(userId: string): Promise<Category[]> {
        return await this.categoryRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: string): Promise<Category> {
        const category = await this.categoryRepository.findOne({ where: { id } });
        if (!category) {
            throw new NotFoundException(`Category with ID ${id} not found`);
        }
        return category;
    }

    async findOneByUser(id: string, userId: string): Promise<Category> {
        const category = await this.categoryRepository.findOne({
            where: { id, userId },
        });
        if (!category) {
            throw new NotFoundException(`Category with ID ${id} not found`);
        }
        return category;
    }

    async updateByUser(id: string, userId: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
        const category = await this.findOne(id);

        if (category.userId !== userId) {
            throw new ForbiddenException('Category does not belong to the user');
        }

        Object.assign(category, updateCategoryDto);
        return await this.categoryRepository.save(category);
    }

    async removeByUser(id: string, userId: string): Promise<void> {
        const category = await this.findOne(id);

        if (category.userId !== userId) {
            throw new ForbiddenException('Category does not belong to the user');
        }

        await this.categoryRepository.delete(id);
    }

    // Keep old methods for internal use
    async findAll(userId?: string): Promise<Category[]> {
        if (userId) {
            return await this.categoryRepository.find({ where: { userId } });
        }
        return await this.categoryRepository.find();
    }

    async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
        const category = await this.findOne(id);
        Object.assign(category, updateCategoryDto);
        return await this.categoryRepository.save(category);
    }

    async remove(id: string): Promise<void> {
        const result = await this.categoryRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Category with ID ${id} not found`);
        }
    }
}
