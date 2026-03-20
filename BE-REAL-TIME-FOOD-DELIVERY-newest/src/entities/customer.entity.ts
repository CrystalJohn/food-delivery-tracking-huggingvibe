import {
  Entity,
  PrimaryColumn,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Address } from './address.entity';
import { Cart } from './cart.entity';
import { Wallet } from './wallet.entity';

@Entity({ name: 'customers' })
export class Customer {
  @PrimaryColumn({ name: 'user_id', type: 'bigint' })
  userId: string;

  @OneToOne(() => User, (user) => user.customerProfile)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Address, { nullable: true })
  @JoinColumn({ name: 'default_address_id' })
  defaultAddress?: Address;

  @OneToMany(() => Cart, (cart) => cart.customer)
  carts: Cart[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  /**
   * Inverse side — Wallet owns the FK (customer_id).
   * No @JoinColumn here because the FK lives in wallets table.
   */
  @OneToOne(() => Wallet, (wallet) => wallet.customer)
  wallet: Wallet;
}