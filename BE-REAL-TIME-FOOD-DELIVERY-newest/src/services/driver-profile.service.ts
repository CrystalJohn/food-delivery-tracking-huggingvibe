import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Driver } from 'src/entities/driver.entity';
import { DriverStatus } from 'src/enums/driver-status.enum';

@Injectable()
export class DriverProfileService {
  constructor(
    @InjectRepository(Driver)
    private readonly driverRepository: Repository<Driver>,
  ) {}

  async setOnlineStatus(userId: string, isOnline: boolean) {
    const driver = await this.driverRepository.findOne({
      where: { userId },
      relations: ['user'],
    });

    if (!driver) {
      throw new NotFoundException('Driver profile not found');
    }

    if (!driver.user) {
      throw new NotFoundException('Driver user not found');
    }

    if (!driver.user.isActive) {
      throw new BadRequestException('Driver account is inactive');
    }

    if (driver.status !== DriverStatus.ACTIVE) {
      throw new BadRequestException('Driver is suspended');
    }

    if (driver.isOnline === isOnline) {
      return this.mapDriverProfileResponse(driver);
    }

    driver.isOnline = isOnline;
    const updatedDriver = await this.driverRepository.save(driver);

    return this.mapDriverProfileResponse({
      ...updatedDriver,
      user: driver.user,
    } as Driver);
  }

  private mapDriverProfileResponse(driver: Driver) {
    return {
      userId: driver.userId,
      fullName: driver.user?.fullName ?? null,
      email: driver.user?.email ?? null,
      phone: driver.user?.phone ?? null,
      userIsActive: driver.user?.isActive ?? false,
      status: driver.status,
      isOnline: driver.isOnline,
      vehicleType: driver.vehicleType,
      licensePlate: driver.licensePlate,
      updatedAt: driver.updatedAt,
    };
  }
}