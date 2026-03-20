import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Driver } from 'src/entities/driver.entity';
import { DriverStatus } from 'src/enums/driver-status.enum';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class DriverRepository {
  constructor(
    @InjectRepository(Driver)
    private readonly repository: Repository<Driver>,
  ) {}

  async findByUserId(
    userId: string,
    manager?: EntityManager,
  ): Promise<Driver | null> {
    const repo = manager ? manager.getRepository(Driver) : this.repository;

    return repo.findOne({
      where: { userId },
      relations: ['user'],
    });
  }

  async findByUserIdForUpdate(
    userId: string,
    manager: EntityManager,
  ): Promise<Driver | null> {
    return manager.getRepository(Driver).findOne({
      where: { userId },
      relations: ['user'],
      lock: { mode: 'pessimistic_write' },
    });
  }

  async findAvailableDrivers(manager?: EntityManager): Promise<Driver[]> {
    const repo = manager ? manager.getRepository(Driver) : this.repository;

    return repo.find({
      where: {
        status: DriverStatus.ACTIVE,
        isOnline: true,
        user: {
          isActive: true,
        },
      },
      relations: ['user'],
      order: {
        updatedAt: 'DESC',
      },
    });
  }

  async save(driver: Driver, manager?: EntityManager): Promise<Driver> {
    const repo = manager ? manager.getRepository(Driver) : this.repository;
    return repo.save(driver);
  }
}