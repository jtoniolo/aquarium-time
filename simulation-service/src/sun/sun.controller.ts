import { Controller, Get } from '@nestjs/common';
import { DistribuitonData, SunService } from './sun.service';

@Controller('suns')
export class SunController {
  constructor(private readonly sunService: SunService) {}

  @Get()
  async getDistribution(): Promise<DistribuitonData[]> {
    const data = this.sunService.getDistributionData();
    console.log(data);
    return data;
  }
}
