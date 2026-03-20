import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CreateDriverDto } from 'src/dto/admin/create-driver.dto';
import { CreateStaffDto } from 'src/dto/admin/create-staff.dto';
import { UpdateDriverDto } from 'src/dto/admin/update-driver.dto';
import { UpdateStaffDto } from 'src/dto/admin/update-staff.dto';
import { UserRole } from 'src/enums/user-role.enum';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { AdminService } from 'src/services/admin.service';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @ApiOperation({ summary: 'Create staff account' })
  @Post('staffs')
  async createStaff(@Body() dto: CreateStaffDto) {
    return this.adminService.createStaff(dto);
  }

  @ApiOperation({ summary: 'Get all staff accounts' })
  @Get('staffs')
  async getAllStaffs() {
    return this.adminService.getAllStaffs();
  }

  @ApiOperation({ summary: 'Get staff detail by userId' })
  @ApiParam({ name: 'userId', description: 'User ID of the staff account' })
  @Get('staffs/:userId')
  async getStaffDetail(@Param('userId') userId: string) {
    return this.adminService.getStaffDetail(userId);
  }

  @ApiOperation({ summary: 'Update staff account by userId' })
  @ApiParam({ name: 'userId', description: 'User ID of the staff account' })
  @Patch('staffs/:userId')
  async updateStaff(
    @Param('userId') userId: string,
    @Body() dto: UpdateStaffDto,
  ) {
    return this.adminService.updateStaff(userId, dto);
  }

  @ApiOperation({ summary: 'Create driver account' })
  @Post('drivers')
  async createDriver(@Body() dto: CreateDriverDto) {
    return this.adminService.createDriver(dto);
  }

  @ApiOperation({ summary: 'Get all driver accounts' })
  @Get('drivers')
  async getAllDrivers() {
    return this.adminService.getAllDrivers();
  }

  @ApiOperation({ summary: 'Get driver detail by userId' })
  @ApiParam({ name: 'userId', description: 'User ID of the driver account' })
  @Get('drivers/:userId')
  async getDriverDetail(@Param('userId') userId: string) {
    return this.adminService.getDriverDetail(userId);
  }

  @ApiOperation({ summary: 'Update driver account by userId' })
  @ApiParam({ name: 'userId', description: 'User ID of the driver account' })
  @Patch('drivers/:userId')
  async updateDriver(
    @Param('userId') userId: string,
    @Body() dto: UpdateDriverDto,
  ) {
    return this.adminService.updateDriver(userId, dto);
  }
}