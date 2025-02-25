import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { AquariumsService } from './aquariums.service';
import { Aquarium } from './aquarium.entity';

@ApiTags('aquariums')
@Controller('aquariums')
export class AquariumsController {
  constructor(private readonly aquariumsService: AquariumsService) {}

  @ApiOperation({ summary: 'Get all aquariums' })
  @ApiResponse({
    status: 200,
    description: 'List of all aquariums with their lights',
    type: Aquarium,
    isArray: true,
  })
  @Get()
  findAll(): Promise<Aquarium[]> {
    return this.aquariumsService.findAll();
  }

  @ApiOperation({ summary: 'Get an aquarium by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the aquarium' })
  @ApiResponse({
    status: 200,
    description: 'The aquarium details',
    type: Aquarium,
  })
  @ApiResponse({ status: 404, description: 'Aquarium not found' })
  @Get(':id')
  findOne(@Param('id') id: string): Promise<Aquarium> {
    return this.aquariumsService.findOne(id);
  }

  @ApiOperation({ summary: 'Create a new aquarium' })
  @ApiResponse({
    status: 201,
    description: 'The aquarium has been created',
    type: Aquarium,
  })
  @Post()
  create(@Body() aquarium: Partial<Aquarium>): Promise<Aquarium> {
    return this.aquariumsService.create(aquarium);
  }

  @ApiOperation({ summary: 'Update an aquarium' })
  @ApiParam({ name: 'id', description: 'The ID of the aquarium to update' })
  @ApiResponse({
    status: 200,
    description: 'The aquarium has been updated',
    type: Aquarium,
  })
  @ApiResponse({ status: 404, description: 'Aquarium not found' })
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() aquarium: Partial<Aquarium>,
  ): Promise<Aquarium> {
    return this.aquariumsService.update(id, aquarium);
  }

  @ApiOperation({ summary: 'Delete an aquarium' })
  @ApiParam({ name: 'id', description: 'The ID of the aquarium to delete' })
  @ApiResponse({ status: 200, description: 'The aquarium has been deleted' })
  @ApiResponse({ status: 404, description: 'Aquarium not found' })
  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.aquariumsService.remove(id);
  }
}
