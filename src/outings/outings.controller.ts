import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
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

  // DELETE endpoints
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an outing' })
  @ApiResponse({ status: 204, description: 'Outing deleted successfully' })
  @ApiResponse({ status: 404, description: 'Outing not found' })
  deleteOuting(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.outingsService.deleteOuting(id, userId);
  }

  @Delete(':outingId/participants/:participantId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a participant from an outing' })
  @ApiResponse({ status: 204, description: 'Participant deleted successfully' })
  @ApiResponse({ status: 404, description: 'Participant not found' })
  deleteParticipant(
    @Param('outingId') outingId: string,
    @Param('participantId') participantId: string,
  ) {
    return this.outingsService.deleteParticipant(outingId, participantId);
  }

  @Delete(':outingId/accounts/:accountId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an account from an outing' })
  @ApiResponse({ status: 204, description: 'Account deleted successfully' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  deleteAccount(
    @Param('outingId') outingId: string,
    @Param('accountId') accountId: string,
  ) {
    return this.outingsService.deleteAccount(outingId, accountId);
  }

  @Delete('accounts/:accountId/products/:productId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a product from an account' })
  @ApiResponse({ status: 204, description: 'Product deleted successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  deleteProduct(
    @Param('accountId') accountId: string,
    @Param('productId') productId: string,
  ) {
    return this.outingsService.deleteProduct(accountId, productId);
  }

  @Delete('accounts/:accountId/payers/:payerId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a payer from an account' })
  @ApiResponse({ status: 204, description: 'Payer deleted successfully' })
  @ApiResponse({ status: 404, description: 'Payer not found' })
  deletePayer(
    @Param('accountId') accountId: string,
    @Param('payerId') payerId: string,
  ) {
    return this.outingsService.deletePayer(accountId, payerId);
  }
}
