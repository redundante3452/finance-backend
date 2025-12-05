import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Outing } from './entities/outing.entity';
import { OutingAccount } from './entities/outing-account.entity';
import { Participant } from './entities/participant.entity';
import { Product } from './entities/product.entity';
import { Payer } from './entities/payer.entity';
import { CreateOutingDto } from './dto/create-outing.dto';
import { CreateParticipantDto } from './dto/create-participant.dto';
import { CreateOutingAccountDto } from './dto/create-outing-account.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { CreatePayerDto } from './dto/create-payer.dto';
import { DebtCalculator } from './domain/debt-calculator';

@Injectable()
export class OutingsService {
  constructor(
    @InjectRepository(Outing)
    private outingRepository: Repository<Outing>,
    @InjectRepository(Participant)
    private participantRepository: Repository<Participant>,
    @InjectRepository(OutingAccount)
    private accountRepository: Repository<OutingAccount>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Payer)
    private payerRepository: Repository<Payer>,
  ) {}

  // Outings
  async createOuting(
    createOutingDto: CreateOutingDto,
    userId: string,
  ): Promise<Outing> {
    const outing = this.outingRepository.create({
      ...createOutingDto,
      userId,
    });
    return await this.outingRepository.save(outing);
  }

  async findAllByUser(userId: string): Promise<Outing[]> {
    return await this.outingRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Outing> {
    const outing = await this.outingRepository.findOne({
      where: { id },
      relations: [
        'participants',
        'accounts',
        'accounts.products',
        'accounts.payers',
      ],
    });

    if (!outing) {
      throw new NotFoundException(`Outing with ID ${id} not found`);
    }
    return outing;
  }

  // Participants
  async addParticipant(
    outingId: string,
    dto: CreateParticipantDto,
  ): Promise<Participant> {
    const participant = this.participantRepository.create({
      ...dto,
      outingId,
    });
    return await this.participantRepository.save(participant);
  }

  // Accounts
  async addAccount(
    outingId: string,
    dto: CreateOutingAccountDto,
  ): Promise<OutingAccount> {
    const account = this.accountRepository.create({
      ...dto,
      outingId,
    });
    return await this.accountRepository.save(account);
  }

  // Products
  async addProduct(accountId: string, dto: CreateProductDto): Promise<Product> {
    // Check if same product exists for same participant to increment quantity
    const existingProduct = await this.productRepository.findOne({
      where: {
        accountId,
        participantId: dto.participantId,
        name: dto.name,
        price: dto.price,
      },
    });

    if (existingProduct) {
      existingProduct.quantity += dto.quantity;
      return await this.productRepository.save(existingProduct);
    }

    const product = this.productRepository.create({
      ...dto,
      accountId,
    });
    return await this.productRepository.save(product);
  }

  // Payers
  async addPayer(accountId: string, dto: CreatePayerDto): Promise<Payer> {
    const payer = this.payerRepository.create({
      ...dto,
      accountId,
    });
    return await this.payerRepository.save(payer);
  }

  // Calculation
  async calculateDebts(outingId: string) {
    const outing = await this.outingRepository.findOne({
      where: { id: outingId },
      relations: [
        'participants',
        'accounts',
        'accounts.products',
        'accounts.payers',
      ],
    });

    if (!outing) {
      throw new NotFoundException('Outing not found');
    }

    return DebtCalculator.calculate(outing);
  }
}
