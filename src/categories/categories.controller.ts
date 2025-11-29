import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('categories')
@Controller('categories')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new category' })
    @ApiResponse({ status: 201, description: 'The category has been successfully created.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    create(
        @CurrentUser('userId') userId: string,
        @Body() createCategoryDto: CreateCategoryDto
    ) {
        return this.categoriesService.create({ ...createCategoryDto, userId });
    }

    @Get()
    @ApiOperation({ summary: 'Get all categories for the user' })
    @ApiResponse({ status: 200, description: 'List of categories.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    findAll(@CurrentUser('userId') userId: string) {
        return this.categoriesService.findByUserId(userId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a category by ID' })
    @ApiResponse({ status: 200, description: 'Return the category.' })
    @ApiResponse({ status: 404, description: 'Category not found.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    findOne(
        @CurrentUser('userId') userId: string,
        @Param('id') id: string
    ) {
        return this.categoriesService.findOneByUser(id, userId);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a category' })
    @ApiResponse({ status: 200, description: 'Category updated.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    update(
        @CurrentUser('userId') userId: string,
        @Param('id') id: string,
        @Body() updateCategoryDto: UpdateCategoryDto
    ) {
        return this.categoriesService.updateByUser(id, userId, updateCategoryDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a category' })
    @ApiResponse({ status: 200, description: 'Category deleted.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    remove(
        @CurrentUser('userId') userId: string,
        @Param('id') id: string
    ) {
        return this.categoriesService.removeByUser(id, userId);
    }
}
