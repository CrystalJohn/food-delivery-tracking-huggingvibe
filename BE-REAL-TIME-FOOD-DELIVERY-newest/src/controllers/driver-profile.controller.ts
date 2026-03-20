import { Controller, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/enums/user-role.enum';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { DriverProfileService } from 'src/services/driver-profile.service';

@ApiTags('Driver Profile')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.DRIVER)
@Controller('driver/profile')
export class DriverProfileController {
  constructor(private readonly driverProfileService: DriverProfileService) {}

  @ApiOperation({ summary: 'Set current driver online' })
  @Patch('online')
  async goOnline(@Req() req: any) {
    return this.driverProfileService.setOnlineStatus(req.user.id, true);
  }

  @ApiOperation({ summary: 'Set current driver offline' })
  @Patch('offline')
  async goOffline(@Req() req: any) {
    return this.driverProfileService.setOnlineStatus(req.user.id, false);
  }
}