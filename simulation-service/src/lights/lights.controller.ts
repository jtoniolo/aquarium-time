import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { LightsService } from './lights.service';
import { Light } from './light.entity';

@ApiTags('lights')
@Controller('lights')
export class LightsController {
  constructor(private readonly lightsService: LightsService) {}

  @ApiOperation({ summary: 'Get all lights' })
  @ApiResponse({
    status: 200,
    description: 'List of all lights',
    type: Light,
    isArray: true,
  })
  @Get()
  findAll(): Promise<Light[]> {
    return this.lightsService.findAll();
  }

  @ApiOperation({ summary: 'Get a light by ID' })
  @ApiParam({ name: 'id', description: 'The entity_id of the light' })
  @ApiResponse({ status: 200, description: 'The light entity', type: Light })
  @ApiResponse({ status: 404, description: 'Light not found' })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Light> {
    const light = await this.lightsService.findOne(id);
    if (!light) {
      throw new NotFoundException(`Light with ID ${id} not found`);
    }
    return light;
  }

  @ApiOperation({ summary: 'Create a new light' })
  @ApiResponse({
    status: 201,
    description: 'The light has been created',
    type: Light,
  })
  @Post()
  create(@Body() light: Light): Promise<Light> {
    return this.lightsService.create(light);
  }

  @ApiOperation({ summary: 'Update a light' })
  @ApiParam({ name: 'id', description: 'The entity_id of the light to update' })
  @ApiResponse({
    status: 200,
    description: 'The light has been updated',
    type: Light,
  })
  @ApiResponse({ status: 404, description: 'Light not found' })
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() light: Partial<Light>,
  ): Promise<Light> {
    return this.lightsService.update(id, light);
  }

  @ApiOperation({ summary: 'Delete a light' })
  @ApiParam({ name: 'id', description: 'The entity_id of the light to delete' })
  @ApiResponse({ status: 200, description: 'The light has been deleted' })
  @ApiResponse({ status: 404, description: 'Light not found' })
  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.lightsService.remove(id);
  }
}
