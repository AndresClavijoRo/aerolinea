import { Module } from '@nestjs/common';
import { AerolineaService } from './aerolinea.service';
import { AerolineaEntity } from './aerolinea.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([AerolineaEntity])],
  providers: [AerolineaService],
})
export class AerolineaModule {}
