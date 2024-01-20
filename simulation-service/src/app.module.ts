import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { SunModule } from './sun/sun.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ScheduleModule.forRoot(), SunModule, ConfigModule.forRoot()],

  providers: [AppService],
})
export class AppModule {}
