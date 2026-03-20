import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Wallet } from 'src/entities/wallet.entity';

@Injectable()
export class WalletRepository {
  constructor(
    @InjectRepository(Wallet)
    private readonly repository: Repository<Wallet>,
  ) {}

  async findByCustomerId(customerId: string): Promise<Wallet | null> {
    return this.repository.findOne({
      where: { customerId },
    });
  }

  async findByCustomerIdWithCustomer(
    customerId: string,
  ): Promise<Wallet | null> {
    return this.repository.findOne({
      where: { customerId },
      relations: ['customer'],
    });
  }

  async findByCustomerIdForUpdate(
    customerId: string,
    manager: EntityManager,
  ): Promise<Wallet | null> {
    return manager.findOne(Wallet, {
      where: { customerId },
      lock: { mode: 'pessimistic_write' },
    });
  }

  async save(wallet: Wallet, manager?: EntityManager): Promise<Wallet> {
    const repo = manager ? manager.getRepository(Wallet) : this.repository;
    return repo.save(wallet);
  }
}