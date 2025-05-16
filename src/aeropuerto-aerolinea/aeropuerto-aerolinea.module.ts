import { Module } from '@nestjs/common';
import { AeropuertoAerolineaService } from './aeropuerto-aerolinea.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AerolineaEntity } from 'src/aerolinea/aerolinea.entity';
import { AeropuertoEntity } from 'src/aeropuerto/aeropuerto.entity';

@Module({
  providers: [AeropuertoAerolineaService],
  imports: [TypeOrmModule.forFeature([AerolineaEntity, AeropuertoEntity])],
})
export class AeropuertoAerolineaModule {}
