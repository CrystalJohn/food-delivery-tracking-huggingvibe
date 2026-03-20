import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MenuCategory } from '../entities/menu-category.entity';
import { MenuItem } from '../entities/menu-item.entity';
import { MenuItemImage } from '../entities/menu-item-image.entity';

@Injectable()
export class MenuSeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(MenuSeedService.name);

  constructor(
    @InjectRepository(MenuCategory)
    private readonly categoryRepository: Repository<MenuCategory>,

    @InjectRepository(MenuItem)
    private readonly itemRepository: Repository<MenuItem>,

    @InjectRepository(MenuItemImage)
    private readonly itemImageRepository: Repository<MenuItemImage>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.seed();
  }

  private async seed(): Promise<void> {
    if (process.env.NODE_ENV === 'production') {
      this.logger.log('Skip menu seed in production.');
      return;
    }

    const categoryCount = await this.categoryRepository.count();
    const itemCount = await this.itemRepository.count();

    if (categoryCount > 0 || itemCount > 0) {
      this.logger.log('Menu seed skipped because data already exists.');
      return;
    }

    this.logger.log('Start seeding menu data...');

    const categoryPayloads = [
      {
        name: 'Pizza',
        description: 'Freshly baked pizza favorites',
        sortOrder: 1,
        isActive: true,
      },
      {
        name: 'Burger',
        description: 'Classic burgers and cheeseburgers',
        sortOrder: 2,
        isActive: true,
      },
      {
        name: 'Fried Chicken',
        description: 'Crispy fried chicken meals',
        sortOrder: 3,
        isActive: true,
      },
      {
        name: 'Pasta',
        description: 'Comforting pasta dishes',
        sortOrder: 4,
        isActive: true,
      },
      {
        name: 'Rice Meals',
        description: 'Rice bowls and set meals',
        sortOrder: 5,
        isActive: true,
      },
      {
        name: 'Sides',
        description: 'Snacks and side dishes',
        sortOrder: 6,
        isActive: true,
      },
      {
        name: 'Drinks',
        description: 'Cold drinks and soft beverages',
        sortOrder: 7,
        isActive: true,
      },
      {
        name: 'Milk Tea',
        description: 'Milk tea and tea-based drinks',
        sortOrder: 8,
        isActive: true,
      },
      {
        name: 'Desserts',
        description: 'Sweet treats and desserts',
        sortOrder: 9,
        isActive: true,
      },
      {
        name: 'Combo',
        description: 'Value combo meals',
        sortOrder: 10,
        isActive: true,
      },
    ];

    const savedCategories = await this.categoryRepository.save(
      categoryPayloads.map((payload) => this.categoryRepository.create(payload)),
    );

    const categoryMap = new Map<string, MenuCategory>();
    for (const category of savedCategories) {
      categoryMap.set(category.name, category);
    }

    const baseImageUrl =
      'https://images.unsplash.com/photo-1728657862761-555d8947ae1c?auto=format&fit=crop&w=800&q=80';

    const buildImagePair = (satA: number, satB: number) => [
      {
        imageUrl: `${baseImageUrl}&sat=${satA}`,
        isThumbnail: true,
        sortOrder: 0,
      },
      {
        imageUrl: `${baseImageUrl}&sat=${satB}`,
        isThumbnail: false,
        sortOrder: 1,
      },
    ];

    const itemPayloads: Array<{
      categoryName: string;
      name: string;
      description: string;
      price: number;
      isAvailable: boolean;
      isActive: boolean;
      sortOrder: number;
      images: Array<{
        imageUrl: string;
        isThumbnail: boolean;
        sortOrder: number;
      }>;
    }> = [
      {
        categoryName: 'Pizza',
        name: 'Seafood Deluxe Pizza',
        description: 'Shrimp, squid, and mozzarella on a crispy crust',
        price: 199000,
        isAvailable: true,
        isActive: true,
        sortOrder: 1,
        images: buildImagePair(10, -10),
      },
      {
        categoryName: 'Pizza',
        name: 'Pepperoni Pizza',
        description: 'Classic pepperoni with rich tomato sauce',
        price: 179000,
        isAvailable: true,
        isActive: true,
        sortOrder: 2,
        images: buildImagePair(15, -5),
      },
      {
        categoryName: 'Burger',
        name: 'Classic Beef Burger',
        description: 'Grilled beef patty with lettuce and tomato',
        price: 159000,
        isAvailable: true,
        isActive: true,
        sortOrder: 1,
        images: buildImagePair(5, -15),
      },
      {
        categoryName: 'Burger',
        name: 'Cheese Burger',
        description: 'Juicy burger layered with cheddar cheese',
        price: 169000,
        isAvailable: true,
        isActive: true,
        sortOrder: 2,
        images: buildImagePair(20, -8),
      },
      {
        categoryName: 'Fried Chicken',
        name: 'Crispy Fried Chicken (2 pcs)',
        description: 'Golden fried chicken with a crunchy coating',
        price: 69000,
        isAvailable: true,
        isActive: true,
        sortOrder: 1,
        images: buildImagePair(8, -12),
      },
      {
        categoryName: 'Fried Chicken',
        name: 'Spicy Fried Chicken (4 pcs)',
        description: 'Spicy fried chicken for sharing',
        price: 129000,
        isAvailable: true,
        isActive: true,
        sortOrder: 2,
        images: buildImagePair(12, -6),
      },
      {
        categoryName: 'Pasta',
        name: 'Spaghetti Bolognese',
        description: 'Pasta with slow-cooked beef ragu',
        price: 99000,
        isAvailable: true,
        isActive: true,
        sortOrder: 1,
        images: buildImagePair(6, -9),
      },
      {
        categoryName: 'Pasta',
        name: 'Creamy Mushroom Pasta',
        description: 'Rich cream sauce with mushrooms',
        price: 109000,
        isAvailable: true,
        isActive: true,
        sortOrder: 2,
        images: buildImagePair(14, -4),
      },
      {
        categoryName: 'Rice Meals',
        name: 'Teriyaki Chicken Rice',
        description: 'Grilled chicken with sweet teriyaki glaze',
        price: 89000,
        isAvailable: true,
        isActive: true,
        sortOrder: 1,
        images: buildImagePair(9, -11),
      },
      {
        categoryName: 'Rice Meals',
        name: 'Beef Stir-fry Rice',
        description: 'Stir-fried beef with vegetables over rice',
        price: 95000,
        isAvailable: true,
        isActive: true,
        sortOrder: 2,
        images: buildImagePair(11, -7),
      },
      {
        categoryName: 'Sides',
        name: 'French Fries',
        description: 'Crispy golden fries with a light salt',
        price: 39000,
        isAvailable: true,
        isActive: true,
        sortOrder: 1,
        images: buildImagePair(16, -3),
      },
      {
        categoryName: 'Sides',
        name: 'Fried Sausage',
        description: 'Savory fried sausage bites',
        price: 49000,
        isAvailable: true,
        isActive: true,
        sortOrder: 2,
        images: buildImagePair(7, -13),
      },
      {
        categoryName: 'Drinks',
        name: 'Coca Cola Can',
        description: 'Chilled soda for extra refreshment',
        price: 18000,
        isAvailable: true,
        isActive: true,
        sortOrder: 1,
        images: buildImagePair(18, -2),
      },
      {
        categoryName: 'Drinks',
        name: 'Lemon Iced Tea',
        description: 'Refreshing tea with lemon',
        price: 18000,
        isAvailable: true,
        isActive: true,
        sortOrder: 2,
        images: buildImagePair(13, -5),
      },
      {
        categoryName: 'Milk Tea',
        name: 'Classic Milk Tea',
        description: 'Creamy black tea with milk',
        price: 45000,
        isAvailable: true,
        isActive: true,
        sortOrder: 1,
        images: buildImagePair(17, -1),
      },
      {
        categoryName: 'Milk Tea',
        name: 'Matcha Milk Tea',
        description: 'Matcha tea blended with milk',
        price: 55000,
        isAvailable: true,
        isActive: true,
        sortOrder: 2,
        images: buildImagePair(4, -16),
      },
      {
        categoryName: 'Desserts',
        name: 'Tiramisu',
        description: 'Classic Italian coffee dessert',
        price: 52000,
        isAvailable: true,
        isActive: true,
        sortOrder: 1,
        images: buildImagePair(3, -18),
      },
      {
        categoryName: 'Desserts',
        name: 'Caramel Pudding',
        description: 'Silky caramel custard',
        price: 32000,
        isAvailable: true,
        isActive: true,
        sortOrder: 2,
        images: buildImagePair(2, -20),
      },
      {
        categoryName: 'Combo',
        name: 'Pizza + Drink Combo',
        description: 'Personal pizza with a canned drink',
        price: 219000,
        isAvailable: true,
        isActive: true,
        sortOrder: 1,
        images: buildImagePair(1, -17),
      },
      {
        categoryName: 'Combo',
        name: 'Burger + Fries + Drink Combo',
        description: 'Burger, fries, and a cold drink',
        price: 159000,
        isAvailable: true,
        isActive: true,
        sortOrder: 2,
        images: buildImagePair(19, -14),
      },
    ];

    for (const payload of itemPayloads) {
      const category = categoryMap.get(payload.categoryName);

      if (!category) {
        this.logger.warn(`Category not found for item: ${payload.name}`);
        continue;
      }

      const createdItem = this.itemRepository.create({
        categoryId: category.id,
        name: payload.name,
        description: payload.description,
        price: payload.price,
        isAvailable: payload.isAvailable,
        isActive: payload.isActive,
        sortOrder: payload.sortOrder,
      });

      const savedItem = await this.itemRepository.save(createdItem);

      const itemImages = payload.images.map((image) =>
        this.itemImageRepository.create({
          menuItemId: savedItem.id,
          imageUrl: image.imageUrl,
          isThumbnail: image.isThumbnail,
          sortOrder: image.sortOrder,
        }),
      );

      await this.itemImageRepository.save(itemImages);
    }

    this.logger.log('Seeding menu completed: 10 categories and 20 items created.');
  }
}
