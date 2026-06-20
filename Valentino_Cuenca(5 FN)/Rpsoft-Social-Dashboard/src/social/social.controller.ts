import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { SocialDataService } from './social-data.service';

@Controller('api/social')
export class SocialController {
  constructor(private socialDataService: SocialDataService) {}

  @Get('summary')
  getSummary(
    @Query('startDate') startDate?: string,
    @Query('endDate')   endDate?: string,
    @Query('brand')     brand?: string,
  ) {
    return this.socialDataService.getSummary(startDate, endDate, brand);
  }

  @Get('accounts')
  getAccounts(
    @Query('startDate') startDate?: string,
    @Query('endDate')   endDate?: string,
    @Query('brand')     brand?: string,
  ) {
    return this.socialDataService.getAllAccounts(startDate, endDate, brand);
  }

  @Get('groups')
  getGroups() {
    return this.socialDataService.getGroups();
  }

  @Post('groups/snapshot')
  addGroupSnapshot(
    @Body() body: { groupId: string; date: string; members: number },
  ) {
    if (!body.groupId || !body.date || body.members === undefined) {
      return { success: false, message: 'groupId, date y members son requeridos' };
    }
    return this.socialDataService.addGroupSnapshot(body.groupId, body.date, body.members);
  }
}
