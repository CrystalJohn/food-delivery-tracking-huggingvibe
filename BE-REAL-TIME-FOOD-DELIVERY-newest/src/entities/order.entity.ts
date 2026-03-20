import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Customer } from './customer.entity';
import { Driver } from './driver.entity';
import { OrderItem } from './order-item.entity';
import { OrderStatus } from 'src/enums/order-status.enum';
import { PaymentMethod } from 'src/enums/payment-method.enum';
import { PaymentStatus } from 'src/enums/payment-status.enum';

@Entity({ name: 'orders' })
export class Order {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'customer_id', type: 'bigint' })
  customerId: string;

  @ManyToOne(() => Customer, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'customer_id',
    referencedColumnName: 'userId',
  })
  customer: Customer;

  @Column({ name: 'driver_id', type: 'bigint', nullable: true })
  driverId: string | null;

  @ManyToOne(() => Driver, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({
    name: 'driver_id',
    referencedColumnName: 'userId',
  })
  driver: Driver | null;

  @Column({
    name: 'status',
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({
    name: 'payment_method',
    type: 'enum',
    enum: PaymentMethod,
  })
  paymentMethod: PaymentMethod;

  @Column({
    name: 'payment_status',
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.UNPAID,
  })
  paymentStatus: PaymentStatus;

  @Column({
    name: 'total_amount',
    type: 'int',
    default: 0,
  })
  totalAmount: number;

  @Column({
    name: 'assigned_at',
    type: 'timestamp',
    nullable: true,
  })
  assignedAt: Date | null;

  @Column({
    name: 'picked_up_at',
    type: 'timestamp',
    nullable: true,
  })
  pickedUpAt: Date | null;

  @Column({
    name: 'delivered_at',
    type: 'timestamp',
    nullable: true,
  })
  deliveredAt: Date | null;

  @Column({
    name: 'driver_confirmed_delivered',
    type: 'boolean',
    default: false,
  })
  driverConfirmedDelivered: boolean;

  @Column({
    name: 'customer_confirmed_delivered',
    type: 'boolean',
    default: false,
  })
  customerConfirmedDelivered: boolean;

  @Column({
    name: 'delivery_address_text',
    type: 'text',
    nullable: true,
  })
  deliveryAddressText: string | null;

  @Column({
    name: 'delivery_lat',
    type: 'double precision',
    nullable: true,
  })
  deliveryLat: number | null;

  @Column({
    name: 'delivery_lng',
    type: 'double precision',
    nullable: true,
  })
  deliveryLng: number | null;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, {
    cascade: false,
  })
  items: OrderItem[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}