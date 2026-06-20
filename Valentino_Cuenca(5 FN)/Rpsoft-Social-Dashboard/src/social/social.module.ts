import { Module } from '@nestjs/common';
import { SocialDataService } from './social-data.service';
import { SocialController } from './social.controller';

@Module({
  providers: [SocialDataService],
  controllers: [SocialController],
  exports: [SocialDataService],
})
export class SocialModule {}
