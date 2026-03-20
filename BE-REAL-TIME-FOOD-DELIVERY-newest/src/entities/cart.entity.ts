import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Customer } from './customer.entity';
import { CartItem } from './cart-item.entity';
import { CartStatus } from 'src/enums/cart-status.enum';

/**
 * Mỗi customer chỉ có tối đa 1 ACTIVE cart.
 *
 * Constraint được enforce bởi PostgreSQL partial unique index:
 *   CREATE UNIQUE INDEX "UQ_one_active_cart_per_customer"
 *   ON "carts" ("customer_id") WHERE "status" = 'ACTIVE'
 *
 * TypeORM không hỗ trợ partial unique index qua decorator,
 * nên constraint này được tạo bằng migration.
 */
@Entity({ name: 'carts' })
export class Cart {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'customer_id', type: 'bigint' })
  customerId: string;

  @ManyToOne(() => Customer, (customer) => customer.carts, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'customer_id',
    referencedColumnName: 'userId',
  })
  customer: Customer;

  @Column({
    type: 'enum',
    enum: CartStatus,
    default: CartStatus.ACTIVE,
  })
  status: CartStatus;

  @OneToMany(() => CartItem, (cartItem) => cartItem.cart)
  items: CartItem[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}