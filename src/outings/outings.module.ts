import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OutingsService } from './outings.service';
import { OutingsController } from './outings.controller';
import { Outing } from './entities/outing.entity';
import { Participant } from './entities/participant.entity';
import { OutingAccount } from './entities/outing-account.entity';
import { Product } from './entities/product.entity';
import { Payer } from './entities/payer.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Outing,
      Participant,
      OutingAccount,
      Product,
      Payer,
    ]),
    AuthModule,
  ],
  controllers: [OutingsController],
  providers: [OutingsService],
  exports: [OutingsService],
})
export class OutingsModule {}
