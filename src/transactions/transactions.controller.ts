import { Controller, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

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
}
