import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Aquarium } from './aquarium.entity';
import { Light } from '../lights/light.entity';

@Injectable()
export class AquariumsService {
  constructor(
    @InjectRepository(Aquarium)
    private aquariumRepository: Repository<Aquarium>,
  ) {}

  async findAll(): Promise<Aquarium[]> {
    const aquariums = await this.aquariumRepository.find();
    // Load the lights for each aquarium
    const populatedAquariums = await Promise.all(
      aquariums.map(async (aquarium) => {
        const lights = await aquarium.lights;
        return {
          ...aquarium,
          lights: Promise.resolve(lights), // Maintain the Promise<Light[]> type
        };
      })
    );
    return populatedAquariums;
  }

  async findOne(id: string): Promise<Aquarium> {
    const aquarium = await this.aquariumRepository.findOne({
      where: { id },
    });

    if (!aquarium) {
      throw new NotFoundException(`Aquarium with ID ${id} not found`);
    }

    // Load the lights and maintain the Promise type
    const lights = await aquarium.lights;
    return {
      ...aquarium,
      lights: Promise.resolve(lights),
    };
  }

  create(aquarium: Partial<Aquarium>): Promise<Aquarium> {
    const newAquarium = this.aquariumRepository.create(aquarium);
    return this.aquariumRepository.save(newAquarium);
  }

  async update(id: string, aquariumData: Partial<Aquarium>): Promise<Aquarium> {
    const aquarium = await this.findOne(id); // This loads the existing aquarium with relations

    // Merge the new data with the existing entity
    const updatedAquarium = this.aquariumRepository.merge(
      aquarium,
      aquariumData,
    );

    // Save the merged entity
    return this.aquariumRepository.save(updatedAquarium);
  }

  async remove(id: string): Promise<void> {
    const aquarium = await this.findOne(id);
    await this.aquariumRepository.remove(aquarium);
  }
}
