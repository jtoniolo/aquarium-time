import { Module } from '@nestjs/common';
import { MqttService } from './mqtt.service';

@Module({
  imports: [],
  controllers: [],
  providers: [MqttService],
})
export class MqttModule {}
