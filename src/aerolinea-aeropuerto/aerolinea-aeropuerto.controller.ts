import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseInterceptors,
} from '@nestjs/common';
import { BusinessErrorsInterceptor } from '../shared/interceptors/business-errors/business-errors.interceptor';
import { AerolineaAeropuertoService } from './aerolinea-aeropuerto.service';
import { AeropuertoDto } from 'src/aeropuerto/aeropuerto.dto';
import { plainToInstance } from 'class-transformer';
import { AeropuertoEntity } from '../aeropuerto/aeropuerto.entity';

@Controller('airlines')
@UseInterceptors(BusinessErrorsInterceptor)
export class AerolineaAeropuertoController {
  constructor(private readonly aerolineaAeropuertoService: AerolineaAeropuertoService) {}

  @Post(':airlineId/airports/:airportId')
  async addAirportToAirline(
    @Param('airlineId', ParseIntPipe) airlineId: number,
    @Param('airportId', ParseIntPipe) airportId: number,
  ) {
    return await this.aerolineaAeropuertoService.addAirportToAirline(airportId, airlineId);
  }

  @Get(':airlineId/airports')
  async findAirportsFromAirline(@Param('airlineId', ParseIntPipe) airlineId: number) {
    return await this.aerolineaAeropuertoService.findAirportsFromAirline(airlineId);
  }

  @Get(':airlineId/airports/:airportId')
  async findAirportFromAirline(
    @Param('airlineId', ParseIntPipe) airlineId: number,
    @Param('airportId', ParseIntPipe) airportId: number,
  ) {
    return await this.aerolineaAeropuertoService.findAirportFromAirline(airportId, airlineId);
  }

  @Put(':airlineId/airports')
  async updateAirportsFromAirline(
    @Param('airlineId', ParseIntPipe) airlineId: number,
    @Body() aeropuertoDto: AeropuertoDto[],
  ) {
    const aeropuertos = plainToInstance(AeropuertoEntity, aeropuertoDto);
    return await this.aerolineaAeropuertoService.updateAirportsFromAirline(airlineId, aeropuertos);
  }

  @Delete(':airlineId/airports/:airportId')
  async deleteAirportFromAirline(
    @Param('airlineId', ParseIntPipe) airlineId: number,
    @Param('airportId', ParseIntPipe) airportId: number,
  ) {
    return await this.aerolineaAeropuertoService.deleteAirportFromAirline(airportId, airlineId);
  }
}
