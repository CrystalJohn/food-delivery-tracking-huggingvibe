import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Order } from './order.entity';

@Entity({ name: 'order_items' })
export class OrderItem {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'order_id', type: 'bigint' })
  orderId: string;

  @ManyToOne(() => Order, (order) => order.items, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ name: 'menu_item_id', type: 'int' })
  menuItemId: number;

  @Column({ name: 'menu_item_name', type: 'varchar', length: 255 })
  menuItemName: string;

  @Column({
    name: 'menu_item_description',
    type: 'text',
    nullable: true,
  })
  menuItemDescription: string | null;

  @Column({
    name: 'menu_item_image_url',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  menuItemImageUrl: string | null;

  @Column({
    name: 'menu_item_category_name',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  menuItemCategoryName: string | null;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'int' })
  price: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}