import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Light } from './light.entity';
import { LightsService } from './lights.service';
import { LightsController } from './lights.controller';
import { HomeAssistantModule } from '../homeassistant/homeassistant.module';
import { Logger } from '@nestjs/common';

@Module({
  imports: [TypeOrmModule.forFeature([Light]), HomeAssistantModule],
  providers: [
    LightsService,
    {
      provide: Logger,
      useValue: new Logger('LightsService'),
    },
  ],
  controllers: [LightsController],
  exports: [LightsService],
})
export class LightsModule {}
