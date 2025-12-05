import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OutingsService } from './outings.service';
import { CreateOutingDto } from './dto/create-outing.dto';
import { CreateParticipantDto } from './dto/create-participant.dto';
import { CreateOutingAccountDto } from './dto/create-outing-account.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { CreatePayerDto } from './dto/create-payer.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('outings')
@Controller('outings')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class OutingsController {
  constructor(private readonly outingsService: OutingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new outing' })
  create(@CurrentUser('userId') userId: string, @Body() dto: CreateOutingDto) {
    return this.outingsService.createOuting(dto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'List all outings for user' })
  findAll(@CurrentUser('userId') userId: string) {
    return this.outingsService.findAllByUser(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get outing details' })
  findOne(@Param('id') id: string) {
    return this.outingsService.findOne(id);
  }

  @Post(':id/participants')
  @ApiOperation({ summary: 'Add participant to outing' })
  addParticipant(@Param('id') id: string, @Body() dto: CreateParticipantDto) {
    return this.outingsService.addParticipant(id, dto);
  }

  @Post(':id/accounts')
  @ApiOperation({ summary: 'Add account (bill) to outing' })
  addAccount(@Param('id') id: string, @Body() dto: CreateOutingAccountDto) {
    return this.outingsService.addAccount(id, dto);
  }

  @Post('accounts/:accountId/products')
  @ApiOperation({ summary: 'Add product consumption to account' })
  addProduct(
    @Param('accountId') accountId: string,
    @Body() dto: CreateProductDto,
  ) {
    return this.outingsService.addProduct(accountId, dto);
  }

  @Post('accounts/:accountId/payers')
  @ApiOperation({ summary: 'Add payer to account' })
  addPayer(@Param('accountId') accountId: string, @Body() dto: CreatePayerDto) {
    return this.outingsService.addPayer(accountId, dto);
  }

  @Get(':id/calculate')
  @ApiOperation({ summary: 'Calculate debts and balances' })
  calculate(@Param('id') id: string) {
    return this.outingsService.calculateDebts(id);
  }
}
