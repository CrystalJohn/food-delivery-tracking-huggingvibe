import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from '../entities/user.entity';
import { Customer } from '../entities/customer.entity';
import { Wallet } from '../entities/wallet.entity';
import { Address } from '../entities/address.entity';
import { LoginDto } from '../dto/auth/login.dto';
import { RegisterDto } from '../dto/auth/register.dto';
import { UserRole } from '../enums/user-role.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly dataSource: DataSource,
  ) {}

  async registerCustomer(dto: RegisterDto) {
    const existingUser = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const result = await this.dataSource.transaction(async (manager) => {
      const user = manager.create(User, {
        email: dto.email,
        passwordHash,
        fullName: dto.fullName,
        phone: dto.phone,
        role: UserRole.CUSTOMER,
        isActive: true,
      });

      const createdUser = await manager.save(User, user);

      const address = manager.create(Address, {
        userId: createdUser.id,
        fullAddress: dto.fullAddress,
        lat: dto.lat,
        lng: dto.lng,
        isDefault: true,
      });

      const createdAddress = await manager.save(Address, address);

      const customer = manager.create(Customer, {
        userId: createdUser.id,
        defaultAddress: createdAddress,
      });

      await manager.save(Customer, customer);

      const wallet = manager.create(Wallet, {
        customerId: createdUser.id,
        balance: 0,
      });

      await manager.save(Wallet, wallet);

      return {
        user: createdUser,
        defaultAddress: createdAddress,
      };
    });

    const payload = {
      sub: result.user.id,
      email: result.user.email,
      role: result.user.role,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      user: {
        id: result.user.id,
        email: result.user.email,
        fullName: result.user.fullName,
        role: result.user.role,
        defaultAddress: {
          id: result.defaultAddress.id,
          fullAddress: result.defaultAddress.fullAddress,
          lat: result.defaultAddress.lat,
          lng: result.defaultAddress.lng,
          isDefault: result.defaultAddress.isDefault,
        },
      },
    };
  }

  async login(dto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is inactive');
    }

    const isPasswordMatched = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!isPasswordMatched) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }

  async getMe(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId, isActive: true },
      relations: ['customerProfile', 'customerProfile.defaultAddress'],
    });

    if (!user) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      defaultAddress: this.mapDefaultAddress(
        user.customerProfile?.defaultAddress ?? null,
      ),
    };
  }

  async validateUserById(userId: string) {
    return this.userRepository.findOne({
      where: { id: userId, isActive: true },
    });
  }

  private mapDefaultAddress(address: Address | null) {
    if (!address) {
      return null;
    }

    return {
      id: address.id,
      fullAddress: address.fullAddress,
      lat: address.lat ?? null,
      lng: address.lng ?? null,
      isDefault: address.isDefault,
    };
  }
}
