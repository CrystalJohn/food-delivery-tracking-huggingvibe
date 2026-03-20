import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UpdateMenuAvailabilityDto } from 'src/dto/menu/update-menu-availability.dto';
import { UserRole } from 'src/enums/user-role.enum';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { MenuService } from 'src/services/menu.service';

@ApiTags('Staff Menu')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.STAFF)
@Controller('staff/menu-items')
export class StaffMenuController {
  constructor(private readonly menuService: MenuService) {}

  @ApiOperation({ summary: 'Staff toggle menu item availability' })
  @Patch(':id/availability')
  async updateAvailability(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMenuAvailabilityDto,
  ) {
    return this.menuService.updateAvailability(id, dto.isAvailable);
  }
}