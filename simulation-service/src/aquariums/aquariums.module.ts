import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Aquarium } from './aquarium.entity';
import { AquariumsService } from './aquariums.service';
import { AquariumsController } from './aquariums.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Aquarium])],
  providers: [AquariumsService],
  controllers: [AquariumsController],
  exports: [AquariumsService],
})
export class AquariumsModule {}
