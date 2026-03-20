import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MenuCategory } from 'src/entities/menu-category.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MenuCategoryRepository {
  constructor(
    @InjectRepository(MenuCategory)
    private readonly repository: Repository<MenuCategory>,
  ) {}

  async save(menuCategory: MenuCategory): Promise<MenuCategory> {
    return this.repository.save(menuCategory);
  }

  async findByName(name: string): Promise<MenuCategory | null> {
    return this.repository.findOne({
      where: { name },
    });
  }

  async findById(id: number): Promise<MenuCategory | null> {
    return this.repository.findOne({
      where: { id },
    });
  }

  async findAllActive(): Promise<MenuCategory[]> {
    return this.repository.find({
      where: { isActive: true },
      order: {
        sortOrder: 'ASC',
        id: 'ASC',
      },
    });
  }

  async findAll(): Promise<MenuCategory[]> {
    return this.repository.find({
      order: {
        sortOrder: 'ASC',
        id: 'ASC',
      },
    });
  }
}