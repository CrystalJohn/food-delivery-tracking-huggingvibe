import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from 'src/entities/user.entity';
import { Staff } from 'src/entities/staff.entity';
import { Driver } from 'src/entities/driver.entity';
import { UserRole } from 'src/enums/user-role.enum';
import { DriverStatus } from 'src/enums/driver-status.enum';
import { CreateStaffDto } from 'src/dto/admin/create-staff.dto';
import { UpdateStaffDto } from 'src/dto/admin/update-staff.dto';
import { CreateDriverDto } from 'src/dto/admin/create-driver.dto';
import { UpdateDriverDto } from 'src/dto/admin/update-driver.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Staff)
    private readonly staffRepository: Repository<Staff>,
    @InjectRepository(Driver)
    private readonly driverRepository: Repository<Driver>,
  ) {}

  async createStaff(dto: CreateStaffDto) {
    await this.ensureEmailAndPhoneAreAvailable(dto.email, dto.phone);

    const passwordHash = await bcrypt.hash(dto.password, 10);

    return this.dataSource.transaction(async (manager) => {
      const user = manager.create(User, {
        email: dto.email,
        passwordHash,
        fullName: dto.fullName,
        phone: dto.phone,
        role: UserRole.STAFF,
        isActive: dto.isActive ?? true,
      });

      const createdUser = await manager.save(User, user);

      const staff = manager.create(Staff, {
        userId: createdUser.id,
        isActive: dto.isActive ?? true,
      });

      const createdStaff = await manager.save(Staff, staff);

      return this.mapStaffResponse({
        ...createdStaff,
        user: createdUser,
      } as Staff);
    });
  }

  async getAllStaffs() {
    const staffs = await this.staffRepository.find({
      relations: ['user'],
      order: {
        createdAt: 'DESC',
      },
    });

    return staffs.map((staff) => this.mapStaffResponse(staff));
  }

  async getStaffDetail(userId: string) {
    const staff = await this.staffRepository.findOne({
      where: { userId },
      relations: ['user'],
    });

    if (!staff) {
      throw new NotFoundException('Staff not found');
    }

    return this.mapStaffResponse(staff);
  }

  async updateStaff(userId: string, dto: UpdateStaffDto) {
    const staff = await this.staffRepository.findOne({
      where: { userId },
      relations: ['user'],
    });

    if (!staff) {
      throw new NotFoundException('Staff not found');
    }

    if (dto.phone && dto.phone !== staff.user.phone) {
      await this.ensurePhoneIsAvailable(dto.phone, staff.userId);
    }

    if (dto.fullName !== undefined) {
      staff.user.fullName = dto.fullName;
    }

    if (dto.phone !== undefined) {
      staff.user.phone = dto.phone;
    }

    if (dto.isActive !== undefined) {
      staff.user.isActive = dto.isActive;
      staff.isActive = dto.isActive;
    }

    await this.userRepository.save(staff.user);
    await this.staffRepository.save(staff);

    return this.getStaffDetail(userId);
  }

  async createDriver(dto: CreateDriverDto) {
    await this.ensureEmailAndPhoneAreAvailable(dto.email, dto.phone);

    const passwordHash = await bcrypt.hash(dto.password, 10);

    return this.dataSource.transaction(async (manager) => {
      const user = manager.create(User, {
        email: dto.email,
        passwordHash,
        fullName: dto.fullName,
        phone: dto.phone,
        role: UserRole.DRIVER,
        isActive: dto.isActive ?? true,
      });

      const createdUser = await manager.save(User, user);

      const driver = manager.create(Driver, {
        userId: createdUser.id,
        status: dto.status ?? DriverStatus.ACTIVE,
        isOnline:
          dto.status === DriverStatus.SUSPENDED
            ? false
            : (dto.isOnline ?? false),
        vehicleType: dto.vehicleType,
        licensePlate: dto.licensePlate,
      });

      const createdDriver = await manager.save(Driver, driver);

      return this.mapDriverResponse({
        ...createdDriver,
        user: createdUser,
      } as Driver);
    });
  }

  async getAllDrivers() {
    const drivers = await this.driverRepository.find({
      relations: ['user'],
      order: {
        createdAt: 'DESC',
      },
    });

    return drivers.map((driver) => this.mapDriverResponse(driver));
  }

  async getDriverDetail(userId: string) {
    const driver = await this.driverRepository.findOne({
      where: { userId },
      relations: ['user'],
    });

    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    return this.mapDriverResponse(driver);
  }

  async updateDriver(userId: string, dto: UpdateDriverDto) {
    const driver = await this.driverRepository.findOne({
      where: { userId },
      relations: ['user'],
    });

    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    if (dto.phone && dto.phone !== driver.user.phone) {
      await this.ensurePhoneIsAvailable(dto.phone, driver.userId);
    }

    if (dto.fullName !== undefined) {
      driver.user.fullName = dto.fullName;
    }

    if (dto.phone !== undefined) {
      driver.user.phone = dto.phone;
    }

    if (dto.vehicleType !== undefined) {
      driver.vehicleType = dto.vehicleType;
    }

    if (dto.licensePlate !== undefined) {
      driver.licensePlate = dto.licensePlate;
    }

    if (dto.isActive !== undefined) {
      driver.user.isActive = dto.isActive;

      if (!dto.isActive) {
        driver.isOnline = false;
      }
    }

    if (dto.status !== undefined) {
      driver.status = dto.status;

      if (dto.status === DriverStatus.SUSPENDED) {
        driver.isOnline = false;
        driver.user.isActive = false;
      }

      if (dto.status === DriverStatus.ACTIVE && dto.isActive === undefined) {
        driver.user.isActive = true;
      }
    }

    if (dto.isOnline !== undefined) {
      if (!driver.user.isActive || driver.status === DriverStatus.SUSPENDED) {
        driver.isOnline = false;
      } else {
        driver.isOnline = dto.isOnline;
      }
    }

    await this.userRepository.save(driver.user);
    await this.driverRepository.save(driver);

    return this.getDriverDetail(userId);
  }

  private async ensureEmailAndPhoneAreAvailable(email: string, phone?: string) {
    const existingByEmail = await this.userRepository.findOne({
      where: { email },
    });

    if (existingByEmail) {
      throw new BadRequestException('Email already exists');
    }

    if (phone) {
      await this.ensurePhoneIsAvailable(phone);
    }
  }

  private async ensurePhoneIsAvailable(phone: string, excludeUserId?: string) {
    const existingByPhone = await this.userRepository.findOne({
      where: { phone },
    });

    if (existingByPhone && existingByPhone.id !== excludeUserId) {
      throw new BadRequestException('Phone already exists');
    }
  }

  private mapStaffResponse(staff: Staff) {
    return {
      userId: staff.userId,
      email: staff.user.email,
      fullName: staff.user.fullName,
      phone: staff.user.phone,
      role: staff.user.role,
      isActive: staff.isActive,
      userIsActive: staff.user.isActive,
      createdAt: staff.createdAt,
    };
  }

  private mapDriverResponse(driver: Driver) {
    return {
      userId: driver.userId,
      email: driver.user.email,
      fullName: driver.user.fullName,
      phone: driver.user.phone,
      role: driver.user.role,
      userIsActive: driver.user.isActive,
      status: driver.status,
      isOnline: driver.isOnline,
      vehicleType: driver.vehicleType,
      licensePlate: driver.licensePlate,
      createdAt: driver.createdAt,
    };
  }
}