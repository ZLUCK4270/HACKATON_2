import { Controller, Get, Param, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('api/analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('dashboard')
  async getDashboard(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('brands') brands?: string,
  ) {
    const brandList = brands ? brands.split(',') : undefined;
    return this.analyticsService.getDashboardSummary(
      startDate,
      endDate,
      brandList,
    );
  }

  @Get('top-channels')
  async getTopChannels(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('threshold') threshold?: string,
    @Query('brands') brands?: string,
  ) {
    return this.analyticsService.getTopGrowingChannels(
      startDate,
      endDate,
      threshold ? parseFloat(threshold) : undefined,
      brands ? brands.split(',') : undefined,
    );
  }

  @Get('top-videos')
  async getTopVideos(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('channelId') channelId?: string,
    @Query('limit') limit?: string,
  ) {
    return this.analyticsService.getTopVideos(
      startDate,
      endDate,
      channelId,
      limit ? parseInt(limit) : 10,
    );
  }

  @Get('content-type')
  async getContentType(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getContentTypeComparison(startDate, endDate);
  }

  @Get('trend/:channelId')
  async getTrend(
    @Param('channelId') channelId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getTrend(channelId, startDate, endDate);
  }
}
