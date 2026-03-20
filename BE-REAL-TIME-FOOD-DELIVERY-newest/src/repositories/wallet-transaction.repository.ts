import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { WalletTransaction } from 'src/entities/wallet-transaction.entity';
import { WalletTransactionType } from 'src/enums/wallet-transaction-type.enum';

export interface CreateWalletTransactionParams {
  walletId: string;
  type: WalletTransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  referenceType?: string;
  referenceId?: string;
  description?: string;
}

@Injectable()
export class WalletTransactionRepository {
  constructor(
    @InjectRepository(WalletTransaction)
    private readonly repository: Repository<WalletTransaction>,
  ) {}

  async createWithManager(
    params: CreateWalletTransactionParams,
    manager: EntityManager,
  ): Promise<WalletTransaction> {
    const repo = manager.getRepository(WalletTransaction);

    const transaction = repo.create({
      walletId: params.walletId,
      type: params.type,
      amount: params.amount,
      balanceBefore: params.balanceBefore,
      balanceAfter: params.balanceAfter,
      referenceType: params.referenceType ?? null,
      referenceId: params.referenceId ?? null,
      description: params.description ?? null,
    });

    return repo.save(transaction);
  }

  async findByWalletId(walletId: string): Promise<WalletTransaction[]> {
    return this.repository.find({
      where: { walletId },
      order: { createdAt: 'DESC' },
    });
  }
}