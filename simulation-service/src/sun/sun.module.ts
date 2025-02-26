import { Module } from '@nestjs/common';
import { SunController } from './sun.controller';
import { SunService } from './sun.service';
import { SunGateway } from './sun.gateway';
import { MqttModule } from '../mqtt/mqtt.module';

@Module({
  imports: [MqttModule],
  controllers: [SunController],
  providers: [SunService, SunGateway],
})
export class SunModule {}
