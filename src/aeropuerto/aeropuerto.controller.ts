import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  UseInterceptors,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { BusinessErrorsInterceptor } from '../shared/interceptors/business-errors/business-errors.interceptor';
import { AeropuertoDto } from './aeropuerto.dto';
import { AeropuertoEntity } from './aeropuerto.entity';
import { AeropuertoService } from './aeropuerto.service';

@Controller('aeropuertos')
@UseInterceptors(BusinessErrorsInterceptor)
export class AeropuertoController {
  constructor(private readonly aeropuertoService: AeropuertoService) {}

  @Get()
  async findAll() {
    return await this.aeropuertoService.findAll();
  }

  @Get(':idAeropuerto')
  async findOne(@Param('idAeropuerto') idAeropuerto: string) {
    return await this.aeropuertoService.findOne(idAeropuerto);
  }

  @Post()
  async create(@Body() aeropuertoDto: AeropuertoDto) {
    const aeropuerto: AeropuertoEntity = plainToInstance(AeropuertoEntity, aeropuertoDto);
    return await this.aeropuertoService.create(aeropuerto);
  }

  @Put(':idAeropuerto')
  async update(@Param('idAeropuerto') idAeropuerto: string, @Body() aeropuertoDto: AeropuertoDto) {
    const aeropuerto: AeropuertoEntity = plainToInstance(AeropuertoEntity, aeropuertoDto);
    return await this.aeropuertoService.update(idAeropuerto, aeropuerto);
  }

  @Delete(':idAeropuerto')
  @HttpCode(204)
  async delete(@Param('idAeropuerto') idAeropuerto: string) {
    return await this.aeropuertoService.delete(idAeropuerto);
  }
}
