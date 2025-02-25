import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Light } from './light.entity';
import { LightsService } from './lights.service';
import { LightsController } from './lights.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Light])],
  providers: [LightsService],
  controllers: [LightsController],
  exports: [LightsService],
})
export class LightsModule {}
