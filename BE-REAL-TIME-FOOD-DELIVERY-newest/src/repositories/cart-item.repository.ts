import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CartItem } from 'src/entities/cart-item.entity';
import { DataSource, EntityManager, Repository } from 'typeorm';

@Injectable()
export class CartItemRepository {
  constructor(
    @InjectRepository(CartItem)
    private readonly repository: Repository<CartItem>,
    private readonly dataSource: DataSource,
  ) {}

  async findById(id: string): Promise<CartItem | null> {
    return this.repository.findOne({
      where: { id },
      relations: [
        'cart',
        'cart.customer',
        'menuItem',
        'menuItem.category',
        'menuItem.images',
      ],
    });
  }

  async findByCartIdAndMenuItemId(
    cartId: string,
    menuItemId: number,
    manager?: EntityManager,
  ): Promise<CartItem | null> {
    const repo = manager
      ? manager.getRepository(CartItem)
      : this.repository;

    return repo.findOne({
      where: { cartId, menuItemId },
      relations: [
        'cart',
        'menuItem',
        'menuItem.category',
        'menuItem.images',
      ],
    });
  }

  /**
   * Thêm hoặc cộng dồn quantity — dùng trong transaction đã lock cart.
   * Không cần tự mở transaction vì caller (CartService) đã lock cart rồi.
   */
  async addOrUpdateItem(
    cartId: string,
    menuItemId: number,
    quantity: number,
    manager: EntityManager,
  ): Promise<CartItem> {
    const repo = manager.getRepository(CartItem);

    const existing = await repo.findOne({
      where: { cartId, menuItemId },
    });

    if (existing) {
      existing.quantity += quantity;
      return repo.save(existing);
    }

    try {
      const cartItem = repo.create({ cartId, menuItemId, quantity });
      return await repo.save(cartItem);
    } catch (error: any) {
      // Unique constraint violation fallback
      if (error?.code === '23505') {
        const fallback = await repo.findOne({
          where: { cartId, menuItemId },
        });
        if (fallback) {
          fallback.quantity += quantity;
          return repo.save(fallback);
        }
      }
      throw error;
    }
  }

  async save(cartItem: CartItem, manager?: EntityManager): Promise<CartItem> {
    const repo = manager
      ? manager.getRepository(CartItem)
      : this.repository;
    return repo.save(cartItem);
  }

  async remove(
    cartItem: CartItem,
    manager?: EntityManager,
  ): Promise<CartItem> {
    const repo = manager
      ? manager.getRepository(CartItem)
      : this.repository;
    return repo.remove(cartItem);
  }
}