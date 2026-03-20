import {
  Entity,
  PrimaryColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Order } from './order.entity';
import { DriverStatus } from 'src/enums/driver-status.enum';

@Entity({ name: 'drivers' })
export class Driver {
  @PrimaryColumn({ name: 'user_id', type: 'bigint' })
  userId: string;

  @OneToOne(() => User, (user) => user.driverProfile)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'enum',
    enum: DriverStatus,
    default: DriverStatus.ACTIVE,
  })
  status: DriverStatus;

  @Column({
    name: 'is_online',
    type: 'boolean',
    default: false,
  })
  isOnline: boolean;

  @Column({
    name: 'vehicle_type',
    type: 'varchar',
    length: 40,
    nullable: true,
  })
  vehicleType?: string;

  @Column({
    name: 'license_plate',
    type: 'varchar',
    length: 30,
    nullable: true,
  })
  licensePlate?: string;

  @Column({
    name: 'current_lat',
    type: 'double precision',
    nullable: true,
  })
  currentLat: number | null;

  @Column({
    name: 'current_lng',
    type: 'double precision',
    nullable: true,
  })
  currentLng: number | null;

  @Column({
    name: 'last_location_at',
    type: 'timestamp',
    nullable: true,
  })
  lastLocationAt: Date | null;

  @OneToMany(() => Order, (order) => order.driver)
  orders: Order[];

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
  })
  updatedAt: Date;
}