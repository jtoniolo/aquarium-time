import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { HomeAssistantService } from './homeassistant.service';
import { Logger } from '@nestjs/common';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [
    HomeAssistantService,
    {
      provide: Logger,
      useValue: new Logger('HomeAssistantService'),
    },
  ],
  exports: [HomeAssistantService],
})
export class HomeAssistantModule {}
