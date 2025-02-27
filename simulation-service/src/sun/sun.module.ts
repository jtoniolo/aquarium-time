import { Module, forwardRef } from '@nestjs/common';
import { SunService } from './sun.service';
import { SunController } from './sun.controller';
import { MqttModule } from '../mqtt/mqtt.module';
import { SunGateway } from './sun.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Aquarium } from '../aquariums/aquarium.entity';
import { AquariumsModule } from '../aquariums/aquariums.module';

@Module({
  imports: [
    MqttModule,
    TypeOrmModule.forFeature([Aquarium]),
    forwardRef(() => AquariumsModule), // Use forwardRef to handle circular dependency
  ],
  providers: [SunService, SunGateway],
  controllers: [SunController],
  exports: [SunService], // Export SunService so it can be used by other modules
})
export class SunModule {}
