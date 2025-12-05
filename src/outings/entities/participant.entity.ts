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

@Entity('participants')
export class Participant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @ManyToOne(() => Outing, (outing) => outing.participants, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'outing_id' })
  outing: Outing;

  @Column({ name: 'outing_id' })
  outingId: string;

  @OneToMany(() => Product, (product) => product.participant)
  products: Product[];

  @OneToMany(() => Payer, (payer) => payer.participant)
  payments: Payer[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
