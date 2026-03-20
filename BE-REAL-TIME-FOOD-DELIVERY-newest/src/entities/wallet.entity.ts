import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Customer } from './customer.entity';

@Entity({ name: 'wallets' })
export class Wallet {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'customer_id', type: 'bigint', unique: true })
  customerId: string;

  /**
   * Owning side — this entity has the FK column (customer_id).
   * References Customer.userId since Customer uses userId as PK.
   */
  @OneToOne(() => Customer, (customer) => customer.wallet, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'customer_id',
    referencedColumnName: 'userId',
  })
  customer: Customer;

  @Column({ type: 'int', default: 0 })
  balance: number;
}