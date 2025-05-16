import { Module } from '@nestjs/common';
import { AerolineaService } from './aerolinea.service';
import { AerolineaEntity } from './aerolinea.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AerolineaController } from './aerolinea.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AerolineaEntity])],
  providers: [AerolineaService],
  controllers: [AerolineaController],
})
export class AerolineaModule {}
