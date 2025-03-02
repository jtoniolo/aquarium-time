import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Aquarium } from './aquarium.entity';
import { AquariumsService } from './aquariums.service';
import { AquariumsController } from './aquariums.controller';
import { SunModule } from '../sun/sun.module';
import { HomeAssistantModule } from '../homeassistant/homeassistant.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Aquarium]),
    forwardRef(() => SunModule), // Use forwardRef to handle circular dependency
    HomeAssistantModule,
  ],
  providers: [AquariumsService],
  controllers: [AquariumsController],
  exports: [AquariumsService],
})
export class AquariumsModule {}
