import { Module } from '@nestjs/common';
import { MqttService } from './mqtt.service';
import { Logger } from '@nestjs/common';

@Module({
  imports: [],
  providers: [
    MqttService,
    {
      provide: Logger,
      useValue: new Logger('MqttService'),
    },
  ],
  exports: [MqttService],
})
export class MqttModule {}
