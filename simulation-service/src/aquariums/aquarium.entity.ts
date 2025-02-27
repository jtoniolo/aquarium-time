import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Light } from '../lights/light.entity';
import { SunConfig } from '../sun/sun.model';

@Entity()
export class Aquarium {
  @ApiProperty({ description: 'The unique identifier for the aquarium' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Name of the aquarium',
    example: '55 Gallon Planted',
  })
  @Column()
  name: string;

  @ApiProperty({
    description: 'Description of the aquarium',
    example: 'Tropical community tank',
  })
  @Column({ nullable: true })
  description?: string;

  @ApiProperty({ description: 'Volume in gallons', example: 55 })
  @Column({ type: 'float', nullable: true })
  gallons?: number;

  @ApiProperty({
    description: 'Dimensions in inches (LxWxH)',
    example: '48x13x21',
  })
  @Column({ nullable: true })
  dimensions?: string;

  @ApiProperty({
    description: 'The lights connected to this aquarium',
    type: () => [Light], // Make type lazy with array notation
  })
  @OneToMany(() => Light, (light) => light.aquarium, {
    lazy: true, // Enable lazy loading
  })
  lights: Promise<Light[]>; // Change type to Promise for lazy loading

  @ApiProperty({
    description:
      'Custom lighting configuration for this aquarium. If not set, default sun simulation settings will be used.',
    type: () => SunConfig,
    required: false,
  })
  @Column('json', { nullable: true })
  lightingConfig?: SunConfig;
}
