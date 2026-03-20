import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderItem } from 'src/entities/order-item.entity';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class OrderItemRepository {
  constructor(
    @InjectRepository(OrderItem)
    private readonly repository: Repository<OrderItem>,
  ) {}

  async save(
    orderItem: OrderItem,
    manager?: EntityManager,
  ): Promise<OrderItem> {
    const repo = manager
      ? manager.getRepository(OrderItem)
      : this.repository;

    return repo.save(orderItem);
  }

  async saveMany(
    orderItems: OrderItem[],
    manager: EntityManager,
  ): Promise<OrderItem[]> {
    const repo = manager.getRepository(OrderItem);
    return repo.save(orderItems);
  }
}