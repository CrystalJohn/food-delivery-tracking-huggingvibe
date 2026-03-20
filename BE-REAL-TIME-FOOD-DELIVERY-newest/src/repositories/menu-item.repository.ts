import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MenuItem } from 'src/entities/menu-item.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MenuItemRepository {
  constructor(
    @InjectRepository(MenuItem)
    private readonly repository: Repository<MenuItem>,
  ) {}

  async save(menuItem: MenuItem): Promise<MenuItem> {
    return this.repository.save(menuItem);
  }

  async findByName(name: string): Promise<MenuItem | null> {
    return this.repository.findOne({
      where: { name },
    });
  }

  async findById(id: number): Promise<MenuItem | null> {
    return this.repository.findOne({
      where: { id },
      relations: {
        category: true,
        images: true,
      },
    });
  }

  async findPublicMenu(category?: string): Promise<MenuItem[]> {
    const queryBuilder = this.repository
      .createQueryBuilder('menuItem')
      .leftJoinAndSelect('menuItem.category', 'category')
      .leftJoinAndSelect('menuItem.images', 'images')
      .where('menuItem.isActive = :menuItemIsActive', {
        menuItemIsActive: true,
      })
      .andWhere('menuItem.isAvailable = :menuItemIsAvailable', {
        menuItemIsAvailable: true,
      })
      .andWhere('category.isActive = :categoryIsActive', {
        categoryIsActive: true,
      });

    if (category) {
      queryBuilder.andWhere('LOWER(category.name) = LOWER(:category)', {
        category: category.trim(),
      });
    }

    queryBuilder.orderBy('menuItem.sortOrder', 'ASC');
    queryBuilder.addOrderBy('menuItem.id', 'ASC');
    queryBuilder.addOrderBy('images.sortOrder', 'ASC');
    queryBuilder.addOrderBy('images.id', 'ASC');

    return queryBuilder.getMany();
  }

  async findPublicMenuItemById(id: number): Promise<MenuItem | null> {
    const queryBuilder = this.repository
      .createQueryBuilder('menuItem')
      .leftJoinAndSelect('menuItem.category', 'category')
      .leftJoinAndSelect('menuItem.images', 'images')
      .where('menuItem.id = :id', { id })
      .andWhere('menuItem.isActive = :menuItemIsActive', {
        menuItemIsActive: true,
      })
      .andWhere('menuItem.isAvailable = :menuItemIsAvailable', {
        menuItemIsAvailable: true,
      })
      .andWhere('category.isActive = :categoryIsActive', {
        categoryIsActive: true,
      });

    queryBuilder.orderBy('images.sortOrder', 'ASC');
    queryBuilder.addOrderBy('images.id', 'ASC');

    return queryBuilder.getOne();
  }

  async findAvailableItemForCart(id: number): Promise<MenuItem | null> {
    const queryBuilder = this.repository
      .createQueryBuilder('menuItem')
      .leftJoinAndSelect('menuItem.category', 'category')
      .leftJoinAndSelect('menuItem.images', 'images')
      .where('menuItem.id = :id', { id })
      .andWhere('menuItem.isActive = :menuItemIsActive', {
        menuItemIsActive: true,
      })
      .andWhere('menuItem.isAvailable = :menuItemIsAvailable', {
        menuItemIsAvailable: true,
      })
      .andWhere('category.isActive = :categoryIsActive', {
        categoryIsActive: true,
      });

    queryBuilder.orderBy('images.sortOrder', 'ASC');
    queryBuilder.addOrderBy('images.id', 'ASC');

    return queryBuilder.getOne();
  }
}