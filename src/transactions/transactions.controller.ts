import { Controller, Post, Body, Query, Get, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto/update-transaction.dto';
import { FilterTransactionDto } from './dto/filter-transaction.dto/filter-transaction.dto';
import { TransactionsService } from './transactions.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('transactions')
@Controller('transactions')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class TransactionsController {
    constructor(private readonly transactionsService: TransactionsService) { }

    @Post()
    @ApiOperation({ summary: 'Registrar una nueva transacción' })
    @ApiResponse({ status: 201, description: 'Transacción creada exitosamente.' })
    @ApiResponse({ status: 400, description: 'Datos inválidos.' })
    @ApiResponse({ status: 401, description: 'No autorizado.' })
    create(
        @CurrentUser('userId') userId: string,
        @Body() createTransactionDto: CreateTransactionDto
    ) {
        return this.transactionsService.createTransaction(createTransactionDto, userId);
    }

    @Get()
    @ApiOperation({ summary: 'Listar transacciones con filtros' })
    @ApiResponse({ status: 200, description: 'Lista de transacciones.' })
    @ApiResponse({ status: 401, description: 'No autorizado.' })
    findAll(
        @CurrentUser('userId') userId: string,
        @Query() filterDto: FilterTransactionDto
    ) {
        return this.transactionsService.findAll(filterDto, userId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener una transacción por ID' })
    @ApiResponse({ status: 200, description: 'Transacción encontrada.' })
    @ApiResponse({ status: 404, description: 'Transacción no encontrada.' })
    @ApiResponse({ status: 401, description: 'No autorizado.' })
    findOne(
        @CurrentUser('userId') userId: string,
        @Param('id') id: string
    ) {
        return this.transactionsService.findOne(id, userId);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Actualizar una transacción' })
    @ApiResponse({ status: 200, description: 'Transacción actualizada.' })
    @ApiResponse({ status: 404, description: 'Transacción no encontrada.' })
    @ApiResponse({ status: 401, description: 'No autorizado.' })
    update(
        @CurrentUser('userId') userId: string,
        @Param('id') id: string,
        @Body() updateTransactionDto: UpdateTransactionDto
    ) {
        return this.transactionsService.update(id, updateTransactionDto, userId);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar una transacción' })
    @ApiResponse({ status: 200, description: 'Transacción eliminada.' })
    @ApiResponse({ status: 404, description: 'Transacción no encontrada.' })
    @ApiResponse({ status: 401, description: 'No autorizado.' })
    remove(
        @CurrentUser('userId') userId: string,
        @Param('id') id: string
    ) {
        return this.transactionsService.remove(id, userId);
    }
}
