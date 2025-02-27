import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SunService } from './sun.service';
import {
  SimulatedSun,
  EnhancedSimulatedSun,
  SunConfig,
  DistribuitonData,
} from './sun.model';

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

  @Get('current')
  @ApiOperation({ summary: 'Get current sun simulation state' })
  @ApiResponse({
    status: 200,
    description: 'The current sun simulation state',
    type: SimulatedSun,
  })
  getCurrentSimulation(): SimulatedSun | null {
    return this.sunService.getLatestSimulation();
  }

  @Get('enhanced')
  @ApiOperation({ summary: 'Get enhanced sun simulation state' })
  @ApiResponse({
    status: 200,
    description: 'The enhanced sun simulation state',
    type: EnhancedSimulatedSun,
  })
  getEnhancedSimulation(): EnhancedSimulatedSun | null {
    return this.sunService.getLatestEnhancedSimulation();
  }

  @Post('distribution')
  @ApiOperation({ summary: 'Get light distribution data for given config' })
  @ApiResponse({
    status: 200,
    description: 'The light distribution data throughout the day',
    type: [DistribuitonData],
  })
  getDistributionData(
    @Body() body: { config?: SunConfig },
  ): DistribuitonData[] {
    return this.sunService.getDistributionData(body.config);
  }

  @Post('aquarium/:id')
  @ApiOperation({ summary: 'Get current simulation for specific aquarium' })
  @ApiResponse({
    status: 200,
    description: 'The sun simulation state for the aquarium',
    type: EnhancedSimulatedSun,
  })
  getAquariumSimulation(
    @Param('id') id: string,
    @Body() config?: SunConfig,
  ): EnhancedSimulatedSun {
    return this.sunService.getAquariumSimulation(new Date(), config);
  }
}
