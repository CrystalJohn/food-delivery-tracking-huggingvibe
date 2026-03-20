import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Customer } from '../entities/customer.entity';
import { Staff } from '../entities/staff.entity';
import { Driver } from '../entities/driver.entity';
import { Address } from '../entities/address.entity';
import { MenuCategory } from '../entities/menu-category.entity';
import { MenuItem } from '../entities/menu-item.entity';
import { MenuItemImage } from '../entities/menu-item-image.entity';
import { Cart } from '../entities/cart.entity';
import { CartItem } from '../entities/cart-item.entity';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { Wallet } from '../entities/wallet.entity';
import { WalletTransaction } from '../entities/wallet-transaction.entity';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: '123456',
  database: 'real_time_food_delivery',
  synchronize: true,
  logging: true,
  entities: [
    User,
    Customer,
    Staff,
    Driver,
    Address,
    MenuCategory,
    MenuItem,
    MenuItemImage,
    Cart,
    CartItem,
    Order,
    OrderItem,
    Wallet,
    WalletTransaction,
  ],
};