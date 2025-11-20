import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@ApiTags('accounts')
@Controller('accounts')
export class AccountsController {
    constructor(private readonly accountsService: AccountsService) { }

    @Post()
    @ApiOperation({ summary: 'Crear una nueva cuenta' })
    @ApiResponse({ status: 201, description: 'Cuenta creada exitosamente.' })
    create(@Body() createAccountDto: CreateAccountDto) {
        return this.accountsService.create(createAccountDto);
    }

    @Get()
    @ApiOperation({ summary: 'Listar todas las cuentas' })
    findAll() {
        return this.accountsService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener una cuenta por ID' })
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.accountsService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Actualizar una cuenta' })
    update(@Param('id', ParseUUIDPipe) id: string, @Body() updateAccountDto: UpdateAccountDto) {
        return this.accountsService.update(id, updateAccountDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar una cuenta' })
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.accountsService.remove(id);
    }
}
