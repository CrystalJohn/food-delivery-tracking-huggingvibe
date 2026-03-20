import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from 'src/entities/customer.entity';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class CustomerRepository {
  constructor(
    @InjectRepository(Customer)
    private readonly repository: Repository<Customer>,
  ) {}

  async findByUserId(
    userId: string,
    manager?: EntityManager,
  ): Promise<Customer | null> {
    const repo = manager
      ? manager.getRepository(Customer)
      : this.repository;

    return repo.findOne({
      where: { userId },
      relations: ['user', 'defaultAddress', 'wallet'],
    });
  }

  async save(
    customer: Customer,
    manager?: EntityManager,
  ): Promise<Customer> {
    const repo = manager
      ? manager.getRepository(Customer)
      : this.repository;

    return repo.save(customer);
  }
}

