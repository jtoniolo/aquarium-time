import { Module } from '@nestjs/common';
import { MqttService } from './mqtt.service';

@Module({
  imports: [],
  controllers: [],
  exports: [MqttService],
  providers: [MqttService],
})
export class MqttModule {}
