import { Entity, Column, PrimaryColumn, ManyToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Aquarium } from '../aquariums/aquarium.entity';

@Entity()
export class Light {
  @ApiProperty({
    description: 'The Home Assistant entity ID of the light',
    example: 'light.living_room',
  })
  @PrimaryColumn()
  entity_id: string;

  @ApiProperty({
    description: 'The complete Home Assistant entity state and attributes',
    example: {
      state: 'on',
      attributes: {
        brightness: 255,
        color_mode: 'rgb',
      },
    },
  })
  @Column('simple-json')
  entity_data: unknown;

  @ApiProperty({
    description: 'Last time the entity was updated',
  })
  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  last_updated: Date;

  @ApiProperty({
    description: 'The aquarium this light belongs to',
    nullable: true,
    type: () => Aquarium, // Make type lazy
  })
  @ManyToOne(() => Aquarium, (aquarium) => aquarium.lights, {
    nullable: true,
    lazy: true, // Enable lazy loading
  })
  aquarium: Promise<Aquarium>; // Change type to Promise for lazy loading

  @Column({ nullable: true })
  aquariumId: string;
}
