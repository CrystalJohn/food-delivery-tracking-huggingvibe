import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CreateMenuCategoryDto } from 'src/dto/menu/create-menu-category.dto';
import { CreateMenuItemDto } from 'src/dto/menu/create-menu-item.dto';
import { MenuQueryDto } from 'src/dto/menu/menu-query.dto';
import { UserRole } from 'src/enums/user-role.enum';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { MenuService } from 'src/services/menu.service';

@ApiTags('Menu')
@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @ApiOperation({ summary: 'Get menu items for customer' })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Filter menu items by category name',
    example: 'Pizza',
  })
  @Get()
  async getPublicMenu(@Query() queryDto: MenuQueryDto) {
    return this.menuService.getPublicMenu(queryDto);
  }

  @ApiOperation({ summary: 'Get menu item detail for customer' })
  @Get(':id')
  async getPublicMenuItemDetail(@Param('id', ParseIntPipe) id: number) {
    return this.menuService.getPublicMenuItemDetail(id);
  }

  @ApiOperation({ summary: 'Create menu category (Admin/Staff)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @Post('categories')
  async createCategory(@Body() createMenuCategoryDto: CreateMenuCategoryDto) {
    return this.menuService.createCategory(createMenuCategoryDto);
  }

  @ApiOperation({ summary: 'Create menu item (Admin/Staff)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @Post('items')
  async createMenuItem(@Body() createMenuItemDto: CreateMenuItemDto) {
    return this.menuService.createMenuItem(createMenuItemDto);
  }
}