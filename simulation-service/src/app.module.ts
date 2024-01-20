import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { SunModule } from './sun/sun.module';
import { MqttModule } from './mqtt/mqtt.module';

@Module({
  imports: [MqttModule, SunModule],

  providers: [AppService],
})
export class AppModule {}
