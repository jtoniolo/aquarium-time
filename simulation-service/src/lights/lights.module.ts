import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Light } from './light.entity';
import { LightsService } from './lights.service';
import { LightsController } from './lights.controller';
import { HomeAssistantModule } from '../homeassistant/homeassistant.module';

@Module({
  imports: [TypeOrmModule.forFeature([Light]), HomeAssistantModule],
  providers: [LightsService],
  controllers: [LightsController],
  exports: [LightsService],
})
export class LightsModule {}
