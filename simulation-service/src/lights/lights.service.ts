import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Light } from './light.entity';

@Injectable()
export class LightsService {
  constructor(
    @InjectRepository(Light)
    private lightRepository: Repository<Light>,
  ) {}

  findAll(): Promise<Light[]> {
    return this.lightRepository.find();
  }

  findOne(entity_id: string): Promise<Light> {
    return this.lightRepository.findOneBy({ entity_id });
  }

  async create(light: Light): Promise<Light> {
    return this.lightRepository.save(light);
  }

  async update(entity_id: string, light: Partial<Light>): Promise<Light> {
    await this.lightRepository.update(entity_id, light);
    return this.findOne(entity_id);
  }

  async remove(entity_id: string): Promise<void> {
    await this.lightRepository.delete(entity_id);
  }
}
