import { Controller, Get, Param, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('rankings/growth')
  async getGrowthRanking(@Query('platform') platform?: string) {
    return this.analyticsService.getGrowthRanking(platform || 'youtube');
  }

  @Get('videos/most-successful')
  async getMostSuccessfulVideo(@Query('platform') platform?: string) {
    return this.analyticsService.getMostSuccessfulVideo(platform || 'youtube');
  }

  @Get('stats/format-comparison')
  async getFormatComparison(@Query('platform') platform?: string) {
    return this.analyticsService.getFormatComparison(platform || 'youtube');
  }

  @Get('channels/:channelId/history')
  async getChannelHistory(
    @Param('channelId') channelId: string,
    @Query('platform') platform?: string,
  ) {
    return this.analyticsService.getChannelHistory(channelId, platform || 'youtube');
  }
}
