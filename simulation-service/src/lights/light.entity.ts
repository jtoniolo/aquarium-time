import { Entity, Column, PrimaryColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

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
  entity_data: any;

  @ApiProperty({
    description: 'Last time the entity was updated',
  })
  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  last_updated: Date;
}
