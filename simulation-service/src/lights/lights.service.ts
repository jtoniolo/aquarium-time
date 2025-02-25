import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Light } from './light.entity';
import { HomeAssistantService } from '../homeassistant/homeassistant.service';
import { HALightState } from '../homeassistant/types';

@Injectable()
export class LightsService {
  constructor(
    @InjectRepository(Light)
    private lightRepository: Repository<Light>,
    private readonly haService: HomeAssistantService,
  ) {}

  async findAll(): Promise<Light[]> {
    const haLights = await this.haService.getAllLights();
    const savedLights = await this.lightRepository.find();

    // Ensure all HA lights are in our database
    for (const light of haLights) {
      const existingLight = savedLights.find(
        (l) => l.entity_id === light.entity_id,
      );
      if (!existingLight) {
        await this.create({
          entity_id: light.entity_id,
          entity_data: light,
          last_updated: new Date(light.last_updated),
        });
      }
    }

    return this.lightRepository.find();
  }

  async findOne(entity_id: string): Promise<Light> {
    const light = await this.lightRepository.findOneBy({ entity_id });
    if (light) {
      const haLight = await this.haService.getLightState(entity_id);
      await this.update(entity_id, {
        entity_data: haLight,
        last_updated: new Date(haLight.last_updated),
      });
      return this.lightRepository.findOneBy({ entity_id });
    }
    return null;
  }

  async create(light: Light): Promise<Light> {
    const haLight = await this.haService.getLightState(light.entity_id);
    light.entity_data = haLight;
    light.last_updated = new Date(haLight.last_updated);
    return this.lightRepository.save(light);
  }

  async update(entity_id: string, light: Partial<Light>): Promise<Light> {
    await this.lightRepository.update(entity_id, light);
    return this.findOne(entity_id);
  }

  async updateState(
    entity_id: string,
    state: string,
    attributes?: Partial<HALightState['attributes']>,
  ): Promise<Light> {
    const haLight = await this.haService.updateLightState(
      entity_id,
      state,
      attributes,
    );
    return this.update(entity_id, {
      entity_data: haLight,
      last_updated: new Date(haLight.last_updated),
    });
  }

  async remove(entity_id: string): Promise<void> {
    await this.lightRepository.delete(entity_id);
  }

  async discoverLights(): Promise<HALightState[]> {
    return this.haService.getAllLights();
  }
}
