import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DistribuitonData, SunService } from './sun.service';
import { SimulatedSun, EnhancedSimulatedSun } from './sun.model';

@Controller('suns')
export class SunController {
  constructor(private readonly sunService: SunService) {}

  @Get()
  async getDistribution(): Promise<DistribuitonData[]> {
    const data = this.sunService.getDistributionData();
    console.log(data);
    return data;
  }

  @Get('latest')
  @ApiOperation({
    summary:
      'Get the latest enhanced sun simulation value with time of day information',
  })
  @ApiResponse({
    status: 200,
    description:
      'Returns the latest enhanced simulated sun value with time of day information, or null if no simulation has run yet',
    type: EnhancedSimulatedSun,
  })
  getLatestEnhanced(): EnhancedSimulatedSun | null {
    return this.sunService.getLatestEnhancedSimulation();
  }
}
