import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cart } from 'src/entities/cart.entity';
import { CartStatus } from 'src/enums/cart-status.enum';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class CartRepository {
  constructor(
    @InjectRepository(Cart)
    private readonly repository: Repository<Cart>,
    private readonly dataSource: DataSource,
  ) {}

  async findActiveCartByCustomerId(customerId: string): Promise<Cart | null> {
    return this.repository.findOne({
      where: {
        customerId,
        status: CartStatus.ACTIVE,
      },
      relations: [
        'customer',
        'items',
        'items.menuItem',
        'items.menuItem.category',
        'items.menuItem.images',
      ],
    });
  }

  async findActiveCartByCustomerIdForUpdate(
  customerId: string,
  manager: EntityManager,
): Promise<Cart | null> {
  const locked = await manager
    .getRepository(Cart)
    .createQueryBuilder('cart')
    .setLock('pessimistic_write')
    .where('cart.customer_id = :customerId', { customerId })
    .andWhere('cart.status = :status', { status: CartStatus.ACTIVE })
    .getOne();

  if (!locked) return null;

  return manager.getRepository(Cart).findOne({
    where: { id: locked.id },
    relations: [
      'customer',
      'items',
      'items.menuItem',
      'items.menuItem.category',
      'items.menuItem.images',
    ],
  });
}

  /**
   * Tìm hoặc tạo ACTIVE cart — race-safe nhờ partial unique index.
   *
   * Flow:
   * 1. SELECT FOR UPDATE → nếu có → return
   * 2. Nếu chưa có → INSERT
   * 3. Nếu INSERT bị unique violation (23505) → request khác đã tạo → SELECT lại
   */
  async findOrCreateActiveCart(customerId: string): Promise<Cart> {
    return this.dataSource.transaction(async (manager) => {
      // Bước 1: Thử lock existing ACTIVE cart
      const existing = await manager
        .getRepository(Cart)
        .createQueryBuilder('cart')
        .setLock('pessimistic_write')
        .where('cart.customer_id = :customerId', { customerId })
        .andWhere('cart.status = :status', { status: CartStatus.ACTIVE })
        .getOne();

      if (existing) {
        return this.loadCartWithRelations(existing.id, manager);
      }

      // Bước 2: Tạo mới
      try {
        const cart = manager.getRepository(Cart).create({
          customerId,
          status: CartStatus.ACTIVE,
        });
        const saved = await manager.getRepository(Cart).save(cart);
        return this.loadCartWithRelations(saved.id, manager);
      } catch (error: any) {
        // Bước 3: Unique violation → request khác đã tạo ACTIVE cart
        if (error?.code === '23505') {
          const fallback = await manager.getRepository(Cart).findOne({
            where: { customerId, status: CartStatus.ACTIVE },
            relations: [
              'customer',
              'items',
              'items.menuItem',
              'items.menuItem.category',
              'items.menuItem.images',
            ],
          });

          if (fallback) return fallback;
        }
        throw error;
      }
    });
  }

  async createActiveCartForCustomer(
    customerId: string,
    manager?: EntityManager,
  ): Promise<Cart> {
    const repo = manager ? manager.getRepository(Cart) : this.repository;

    const cart = repo.create({
      customerId,
      status: CartStatus.ACTIVE,
    });

    return repo.save(cart);
  }

  async save(cart: Cart, manager?: EntityManager): Promise<Cart> {
    const repo = manager ? manager.getRepository(Cart) : this.repository;
    return repo.save(cart);
  }

  async withActiveCartLocked<T>(
    customerId: string,
    callback: (cart: Cart, manager: EntityManager) => Promise<T>,
  ): Promise<T> {
    return this.dataSource.transaction(async (manager) => {
      const cart = await this.findActiveCartByCustomerIdForUpdate(
        customerId,
        manager,
      );

      if (!cart) {
        throw new NotFoundException('Active cart not found');
      }

      return callback(cart, manager);
    });
  }

  /**
   * Helper: load cart với đầy đủ relations
   */
  private async loadCartWithRelations(
    cartId: string,
    manager: EntityManager,
  ): Promise<Cart> {
    return manager.getRepository(Cart).findOneOrFail({
      where: { id: cartId },
      relations: [
        'customer',
        'items',
        'items.menuItem',
        'items.menuItem.category',
        'items.menuItem.images',
      ],
    });
  }
}