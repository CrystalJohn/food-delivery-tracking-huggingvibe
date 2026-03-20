import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { UserRole } from '../enums/user-role.enum';
import { Address } from './address.entity';
import { Customer } from './customer.entity';
import { Staff } from './staff.entity';
import { Driver } from './driver.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  passwordHash: string;

  @Column({ name: 'full_name', type: 'varchar', length: 120 })
  fullName: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  phone?: string;

  @Column({
    type: 'enum',
    enum: UserRole,
  })
  role: UserRole;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @OneToMany(() => Address, (address) => address.user)
  addresses: Address[];

  @OneToOne(() => Customer, (customer) => customer.user)
  customerProfile: Customer;

  @OneToOne(() => Staff, (staff) => staff.user)
  staffProfile: Staff;

  @OneToOne(() => Driver, (driver) => driver.user)
  driverProfile: Driver;
}