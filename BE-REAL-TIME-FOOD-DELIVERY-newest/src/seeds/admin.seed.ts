import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from '../entities/user.entity';
import { UserRole } from '../enums/user-role.enum';

@Injectable()
export class AdminSeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AdminSeedService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.seedAdmin();
  }

  private async seedAdmin(): Promise<void> {
    const email = 'admin@gmail.com';

    const existingAdmin = await this.userRepository.findOne({
      where: { email },
    });

    if (existingAdmin) {
      this.logger.log('Admin account already exists.');
      return;
    }

    this.logger.log('Creating default admin account...');

    const passwordHash = await bcrypt.hash('123123', 10);

    const adminUser = this.userRepository.create({
      email,
      passwordHash,
      fullName: 'System Admin',
      phone: '0000000000',
      role: UserRole.ADMIN,
      isActive: true,
    });

    await this.userRepository.save(adminUser);

    this.logger.log('Default admin account created.');
  }
}