import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMenuCategoryDto } from 'src/dto/menu/create-menu-category.dto';
import { CreateMenuItemDto } from 'src/dto/menu/create-menu-item.dto';
import { MenuItemResponseDto } from 'src/dto/menu/menu-item-response.dto';
import { MenuQueryDto } from 'src/dto/menu/menu-query.dto';
import { MenuCategory } from 'src/entities/menu-category.entity';
import { MenuItemImage } from 'src/entities/menu-item-image.entity';
import { MenuItem } from 'src/entities/menu-item.entity';
import { MenuCategoryRepository } from 'src/repositories/menu-category.repository';
import { MenuItemRepository } from 'src/repositories/menu-item.repository';

@Injectable()
export class MenuService {
  constructor(
    private readonly menuCategoryRepository: MenuCategoryRepository,
    private readonly menuItemRepository: MenuItemRepository,
  ) {}

  async createCategory(createMenuCategoryDto: CreateMenuCategoryDto): Promise<MenuCategory> {
    const existingCategory = await this.menuCategoryRepository.findByName(
      createMenuCategoryDto.name.trim(),
    );

    if (existingCategory) {
      throw new BadRequestException('Menu category name already exists');
    }

    const menuCategory = new MenuCategory();
    menuCategory.name = createMenuCategoryDto.name.trim();
    menuCategory.description = createMenuCategoryDto.description?.trim();
    menuCategory.sortOrder = createMenuCategoryDto.sortOrder ?? 0;
    menuCategory.isActive = createMenuCategoryDto.isActive ?? true;

    return this.menuCategoryRepository.save(menuCategory);
  }

  async createMenuItem(createMenuItemDto: CreateMenuItemDto): Promise<MenuItem> {
    const category = await this.menuCategoryRepository.findById(
      createMenuItemDto.categoryId,
    );

    if (!category) {
      throw new NotFoundException('Menu category not found');
    }

    if (!category.isActive) {
      throw new BadRequestException('Cannot create menu item in inactive category');
    }

    const existingMenuItem = await this.menuItemRepository.findByName(
      createMenuItemDto.name.trim(),
    );

    if (existingMenuItem) {
      throw new BadRequestException('Menu item name already exists');
    }

    const menuItem = new MenuItem();
    menuItem.categoryId = createMenuItemDto.categoryId;
    menuItem.name = createMenuItemDto.name.trim();
    menuItem.description = createMenuItemDto.description?.trim();
    menuItem.price = createMenuItemDto.price;
    menuItem.isAvailable = createMenuItemDto.isAvailable ?? true;
    menuItem.isActive = createMenuItemDto.isActive ?? true;
    menuItem.sortOrder = createMenuItemDto.sortOrder ?? 0;

    if (createMenuItemDto.images?.length) {
      const thumbnailCount = createMenuItemDto.images.filter(
        (image) => image.isThumbnail === true,
      ).length;

      if (thumbnailCount > 1) {
        throw new BadRequestException('Only one thumbnail image is allowed');
      }

      menuItem.images = createMenuItemDto.images.map((imageDto) => {
        const image = new MenuItemImage();
        image.imageUrl = imageDto.imageUrl;
        image.isThumbnail = imageDto.isThumbnail ?? false;
        image.sortOrder = imageDto.sortOrder ?? 0;
        return image;
      });
    }

    return this.menuItemRepository.save(menuItem);
  }

  async updateAvailability(id: number, isAvailable: boolean): Promise<MenuItem> {
    const menuItem = await this.menuItemRepository.findById(id);

    if (!menuItem) {
      throw new NotFoundException('Menu item not found');
    }

    if (!menuItem.isActive) {
      throw new BadRequestException(
        'Inactive menu item cannot be toggled by staff',
      );
    }

    menuItem.isAvailable = isAvailable;
    return this.menuItemRepository.save(menuItem);
  }

  async getPublicMenu(queryDto: MenuQueryDto): Promise<MenuItemResponseDto[]> {
    const menuItems = await this.menuItemRepository.findPublicMenu(queryDto.category);
    return menuItems.map((menuItem) => this.toPublicResponse(menuItem));
  }

  async getPublicMenuItemDetail(id: number): Promise<MenuItemResponseDto> {
    const menuItem = await this.menuItemRepository.findPublicMenuItemById(id);

    if (!menuItem) {
      throw new NotFoundException('Menu item not found');
    }

    return this.toPublicResponse(menuItem);
  }

  private toPublicResponse(menuItem: MenuItem): MenuItemResponseDto {
    const thumbnailImage =
      menuItem.images?.find((image) => image.isThumbnail) ??
      menuItem.images?.[0] ??
      null;

    return {
      id: menuItem.id,
      name: menuItem.name,
      description: menuItem.description ?? null,
      price: menuItem.price,
      imageUrl: thumbnailImage?.imageUrl ?? null,
      category: menuItem.category?.name ?? '',
      available: menuItem.isAvailable,
    };
  }
}