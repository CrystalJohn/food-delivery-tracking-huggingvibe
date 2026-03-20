import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';

import { databaseConfig } from './config/database.config';
import { jwtConfig } from './config/jwt.config';

import { User } from './entities/user.entity';
import { Customer } from './entities/customer.entity';
import { Staff } from './entities/staff.entity';
import { Driver } from './entities/driver.entity';
import { Address } from './entities/address.entity';
import { MenuCategory } from './entities/menu-category.entity';
import { MenuItem } from './entities/menu-item.entity';
import { MenuItemImage } from './entities/menu-item-image.entity';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Wallet } from './entities/wallet.entity';
import { WalletTransaction } from './entities/wallet-transaction.entity';

import { AuthController } from './controllers/auth.controller';
import { MenuController } from './controllers/menu.controller';
import { CartController } from './controllers/cart.controller';
import { OrderController } from './controllers/order.controller';
import { StaffOrderController } from './controllers/staff-order.controller';
import { DriverOrderController } from './controllers/driver-order.controller';
import { StaffMenuController } from './controllers/staff-menu.controller';
import { AdminController } from './controllers/admin.controller';
import { DriverProfileController } from './controllers/driver-profile.controller';

import { AuthService } from './services/auth.service';
import { MenuService } from './services/menu.service';
import { CartService } from './services/cart.service';
import { OrderService } from './services/order.service';
import { StaffOrderService } from './services/staff-order.service';
import { DriverOrderService } from './services/driver-order.service';
import { AdminService } from './services/admin.service';
import { DriverProfileService } from './services/driver-profile.service';

import { JwtStrategy } from './auth/jwt.strategy';
import { AuthModule } from './auth/auth.module';

import { MenuCategoryRepository } from './repositories/menu-category.repository';
import { MenuItemRepository } from './repositories/menu-item.repository';
import { CustomerRepository } from './repositories/customer.repository';
import { DriverRepository } from './repositories/driver.repository';
import { CartRepository } from './repositories/cart.repository';
import { CartItemRepository } from './repositories/cart-item.repository';
import { OrderRepository } from './repositories/order.repository';
import { OrderItemRepository } from './repositories/order-item.repository';
import { WalletRepository } from './repositories/wallet.repository';
import { WalletTransactionRepository } from './repositories/wallet-transaction.repository';

import { MenuSeedService } from './seeds/menu.seed';
import { AdminSeedService } from './seeds/admin.seed';
import { TrackingGateway } from './gateways/tracking.gateway';

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig),
    TypeOrmModule.forFeature([
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
    ]),
    AuthModule,
    JwtModule.register({
      secret: jwtConfig.secret,
      signOptions: {
        expiresIn: jwtConfig.expiresIn,
      },
    }),
  ],
  controllers: [
    AuthController,
    MenuController,
    CartController,
    OrderController,
    StaffOrderController,
    DriverOrderController,
    StaffMenuController,
    AdminController,
    DriverProfileController,
  ],
  providers: [
    AuthService,
    MenuService,
    CartService,
    OrderService,
    StaffOrderService,
    DriverOrderService,
    AdminService,
    DriverProfileService,
    JwtStrategy,
    MenuCategoryRepository,
    MenuItemRepository,
    CustomerRepository,
    DriverRepository,
    CartRepository,
    CartItemRepository,
    OrderRepository,
    OrderItemRepository,
    WalletRepository,
    WalletTransactionRepository,
    MenuSeedService,
    AdminSeedService,
    TrackingGateway,
  ],
})
export class AppModule {}