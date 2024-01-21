import { Controller, Get } from '@nestjs/common';
import { SunService } from './sun.service';

@Controller('suns')
export class SunController {
  constructor(private readonly sunService: SunService) {}

  @Get()
  async getDistribution() {
    return this.sunService.getDistributionData();
  }
}
