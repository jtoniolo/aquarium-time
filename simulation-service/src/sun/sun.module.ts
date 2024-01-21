import { Module } from '@nestjs/common';
import { SunService } from './sun.service';
import { MqttModule } from 'src/mqtt/mqtt.module';
import { SunController } from './sun.controller';

@Module({
  imports: [MqttModule],
  controllers: [SunController],
  providers: [SunService],
})
export class SunModule {}
