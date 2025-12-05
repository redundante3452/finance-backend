import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Outing } from './outing.entity';
import { Product } from './product.entity';
import { Payer } from './payer.entity';

export enum ServiceType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED = 'FIXED',
}

@Entity('outing_accounts')
export class OutingAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @ManyToOne(() => Outing, (outing) => outing.accounts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'outing_id' })
  outing: Outing;

  @Column({ name: 'outing_id' })
  outingId: string;

  @Column({
    type: 'enum',
    enum: ServiceType,
    name: 'service_type',
    nullable: true,
  })
  serviceType: ServiceType;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    name: 'service_value',
    default: 0,
  })
  serviceValue: number;

  @Column({ default: false, name: 'has_service' })
  hasService: boolean;

  @OneToMany(() => Product, (product) => product.account, { cascade: true })
  products: Product[];

  @OneToMany(() => Payer, (payer) => payer.account, { cascade: true })
  payers: Payer[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
