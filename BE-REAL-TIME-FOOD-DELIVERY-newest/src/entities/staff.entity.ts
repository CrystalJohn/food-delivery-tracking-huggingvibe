import {
  Entity,
  PrimaryColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'staffs' })
export class Staff {
  @PrimaryColumn({ name: 'user_id', type: 'bigint' })
  userId: string;

  @OneToOne(() => User, (user) => user.staffProfile)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
  })
  isActive: boolean;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
  })
  createdAt: Date;
}