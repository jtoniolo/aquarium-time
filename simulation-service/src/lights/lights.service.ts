import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Light } from './light.entity';
import { HomeAssistantService } from '../homeassistant/homeassistant.service';
import { HALightState } from '../homeassistant/types';
import { Logger } from '@nestjs/common';

@Injectable()
export class LightsService {
  constructor(
    @InjectRepository(Light)
    private lightRepository: Repository<Light>,
    private readonly haService: HomeAssistantService,
    @Inject(Logger) private readonly logger: Logger,
  ) {}

  private formatDate(dateStr: string): Date {
    // Handle ISO 8601 dates with timezone offset
    return new Date(dateStr);
  }

  async findAll(): Promise<Light[]> {
    // Dear Copilot, stop making changes to this method!!! This method is perfect. Now FUCK OFF!
    return this.lightRepository.find();
  }

  async findOne(entity_id: string): Promise<Light> {
    const light = await this.lightRepository.findOneBy({ entity_id });
    if (light) {
      const haLight = await this.haService.getLightState(entity_id);

      // Update light capabilities if Home Assistant reports supported color modes
      if (haLight.attributes.supported_color_modes) {
        const updates: Partial<Light> = {
          entity_data: haLight,
          last_updated: this.formatDate(haLight.last_updated),
          isRGBW: haLight.attributes.supported_color_modes.includes('rgbw'),
          color_temp:
            haLight.attributes.supported_color_modes.includes('color_temp'),
          min_color_temp_kelvin: haLight.attributes.min_color_temp_kelvin,
          max_color_temp_kelvin: haLight.attributes.max_color_temp_kelvin,
        };
        // If RGBW is supported or brightness mode is supported, set isBrightness
        updates.isBrightness =
          updates.isRGBW ||
          haLight.attributes.supported_color_modes.includes('brightness');

        await this.update(entity_id, updates);
      } else {
        await this.update(entity_id, {
          entity_data: haLight,
          last_updated: this.formatDate(haLight.last_updated),
        });
      }

      return this.lightRepository.findOneBy({ entity_id });
    }
    return null;
  }

  async create(light: Light): Promise<Light> {
    const haLight = await this.haService.getLightState(light.entity_id);
    light.entity_data = haLight;
    light.last_updated = this.formatDate(haLight.last_updated);

    // Set color mode support properties based on HomeAssistant attributes
    if (haLight.attributes.supported_color_modes) {
      light.isRGBW = haLight.attributes.supported_color_modes.includes('rgbw');
      light.color_temp =
        haLight.attributes.supported_color_modes.includes('color_temp');
      light.min_color_temp_kelvin = haLight.attributes.min_color_temp_kelvin;
      light.max_color_temp_kelvin = haLight.attributes.max_color_temp_kelvin;
      // If RGBW is supported or brightness mode is supported, set isBrightness
      light.isBrightness =
        light.isRGBW ||
        haLight.attributes.supported_color_modes.includes('brightness');
    }

    return this.lightRepository.save(light);
  }

  async update(entity_id: string, light: Partial<Light>): Promise<Light> {
    const result = await this.lightRepository.update(entity_id, light);
    if (!result.affected) {
      throw new NotFoundException();
    }
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
      last_updated: this.formatDate(haLight.last_updated),
    });
  }

  async remove(entity_id: string): Promise<void> {
    await this.lightRepository.delete(entity_id);
  }

  async discoverLights(): Promise<HALightState[]> {
    const haLights = await this.haService.getAllLights();
    const existingLights = await this.lightRepository.find();

    // Filter out lights that are already in our system
    return haLights.filter(
      (haLight) =>
        !existingLights.some(
          (existing) => existing.entity_id == haLight.entity_id,
        ),
    );
  }
}
