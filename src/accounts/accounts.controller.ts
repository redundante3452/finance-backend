import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('accounts')
@Controller('accounts')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class AccountsController {
    constructor(private readonly accountsService: AccountsService) { }

    @Post()
    @ApiOperation({ summary: 'Crear una nueva cuenta' })
    @ApiResponse({ status: 201, description: 'Cuenta creada exitosamente.' })
    @ApiResponse({ status: 401, description: 'No autorizado.' })
    create(
        @CurrentUser('userId') userId: string,
        @Body() createAccountDto: CreateAccountDto
    ) {
        return this.accountsService.create({ ...createAccountDto, userId });
    }

    @Get()
    @ApiOperation({ summary: 'Listar todas las cuentas del usuario' })
    @ApiResponse({ status: 200, description: 'Lista de cuentas.' })
    @ApiResponse({ status: 401, description: 'No autorizado.' })
    findAll(@CurrentUser('userId') userId: string) {
        return this.accountsService.findByUserId(userId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener una cuenta por ID' })
    @ApiResponse({ status: 200, description: 'Cuenta encontrada.' })
    @ApiResponse({ status: 404, description: 'Cuenta no encontrada.' })
    @ApiResponse({ status: 401, description: 'No autorizado.' })
    findOne(
        @CurrentUser('userId') userId: string,
        @Param('id', ParseUUIDPipe) id: string
    ) {
        return this.accountsService.findOneByUser(id, userId);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Actualizar una cuenta' })
    @ApiResponse({ status: 200, description: 'Cuenta actualizada.' })
    @ApiResponse({ status: 404, description: 'Cuenta no encontrada.' })
    @ApiResponse({ status: 401, description: 'No autorizado.' })
    update(
        @CurrentUser('userId') userId: string,
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateAccountDto: UpdateAccountDto
    ) {
        return this.accountsService.updateByUser(id, userId, updateAccountDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar una cuenta' })
    @ApiResponse({ status: 200, description: 'Cuenta eliminada.' })
    @ApiResponse({ status: 404, description: 'Cuenta no encontrada.' })
    @ApiResponse({ status: 401, description: 'No autorizado.' })
    @ApiResponse({ status: 403, description: 'Prohibido - La cuenta no pertenece al usuario.' })
    remove(
        @CurrentUser('userId') userId: string,
        @Param('id', ParseUUIDPipe) id: string
    ) {
        return this.accountsService.removeByUser(id, userId);
    }
}
