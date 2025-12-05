import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
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
    private dataSource: DataSource,
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
    // Use QueryBuilder to ensure all fields including participantId are loaded
    const outing = await this.dataSource
      .getRepository(Outing)
      .createQueryBuilder('outing')
      .leftJoinAndSelect('outing.participants', 'participants')
      .leftJoinAndSelect('outing.accounts', 'accounts')
      .leftJoinAndSelect('accounts.products', 'products')
      .leftJoinAndSelect('accounts.payers', 'payers')
      .where('outing.id = :id', { id: outingId })
      .getOne();

    if (!outing) {
      throw new NotFoundException('Outing not found');
    }

    return DebtCalculator.calculate(outing);
  }

  // DELETE operations
  async deleteOuting(id: string, userId: string): Promise<void> {
    const outing = await this.outingRepository.findOne({
      where: { id, userId },
    });
    if (!outing) {
      throw new NotFoundException('Outing not found');
    }
    await this.outingRepository.remove(outing);
  }

  async deleteParticipant(
    outingId: string,
    participantId: string,
  ): Promise<void> {
    const participant = await this.participantRepository.findOne({
      where: { id: participantId, outingId },
    });
    if (!participant) {
      throw new NotFoundException('Participant not found');
    }
    await this.participantRepository.remove(participant);
  }

  async deleteAccount(outingId: string, accountId: string): Promise<void> {
    const account = await this.accountRepository.findOne({
      where: { id: accountId, outingId },
    });
    if (!account) {
      throw new NotFoundException('Account not found');
    }
    await this.accountRepository.remove(account);
  }

  async deleteProduct(accountId: string, productId: string): Promise<void> {
    const product = await this.productRepository.findOne({
      where: { id: productId, accountId },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    await this.productRepository.remove(product);
  }

  async deletePayer(accountId: string, payerId: string): Promise<void> {
    const payer = await this.payerRepository.findOne({
      where: { id: payerId, accountId },
    });
    if (!payer) {
      throw new NotFoundException('Payer not found');
    }
    await this.payerRepository.remove(payer);
  }
}
