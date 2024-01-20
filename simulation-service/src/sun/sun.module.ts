import { Module } from '@nestjs/common';
import { SunService } from './sun.service';
import { MqttModule } from 'src/mqtt/mqtt.module';

@Module({
  imports: [MqttModule],
  controllers: [],
  providers: [SunService],
})
export class SunModule {}
