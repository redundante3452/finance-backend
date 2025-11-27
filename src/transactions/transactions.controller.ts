import { Controller, Post, Body, Query, Get, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto/update-transaction.dto';
import { FilterTransactionDto } from './dto/filter-transaction.dto/filter-transaction.dto';
import { TransactionsService } from './transactions.service';

@ApiTags('transactions')
@Controller('transactions')
export class TransactionsController {
    constructor(private readonly transactionsService: TransactionsService) { }

    @Post()
    @ApiOperation({ summary: 'Registrar una nueva transacción' })
    @ApiResponse({ status: 201, description: 'Transacción creada exitosamente.' })
    @ApiResponse({ status: 400, description: 'Datos inválidos.' })
    create(@Body() createTransactionDto: CreateTransactionDto, @Query('userId') userId: string) {
        // TODO: Obtener userId del token de autenticación en el futuro
        return this.transactionsService.createTransaction(createTransactionDto, userId);
    }

    @Get()
    @ApiOperation({ summary: 'Listar transacciones con filtros' })
    @ApiResponse({ status: 200, description: 'Lista de transacciones.' })
    findAll(@Query() filterDto: FilterTransactionDto, @Query('userId') userId: string) {
        return this.transactionsService.findAll(filterDto, userId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener una transacción por ID' })
    @ApiResponse({ status: 200, description: 'Transacción encontrada.' })
    @ApiResponse({ status: 404, description: 'Transacción no encontrada.' })
    findOne(@Param('id') id: string, @Query('userId') userId: string) {
        return this.transactionsService.findOne(id, userId);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Actualizar una transacción' })
    @ApiResponse({ status: 200, description: 'Transacción actualizada.' })
    @ApiResponse({ status: 404, description: 'Transacción no encontrada.' })
    update(
        @Param('id') id: string,
        @Body() updateTransactionDto: UpdateTransactionDto,
        @Query('userId') userId: string,
    ) {
        return this.transactionsService.update(id, updateTransactionDto, userId);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar una transacción' })
    @ApiResponse({ status: 200, description: 'Transacción eliminada.' })
    @ApiResponse({ status: 404, description: 'Transacción no encontrada.' })
    remove(@Param('id') id: string, @Query('userId') userId: string) {
        return this.transactionsService.remove(id, userId);
    }
}
