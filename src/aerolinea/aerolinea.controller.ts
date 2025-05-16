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
import { AerolineaService } from './aerolinea.service';
import { BusinessErrorsInterceptor } from '../shared/interceptors/business-errors/business-errors.interceptor';
import { plainToInstance } from 'class-transformer';
import { AerolineaDto } from './aerolinea.dto';
import { AerolineaEntity } from './aerolinea.entity';

@Controller('aerolineas')
@UseInterceptors(BusinessErrorsInterceptor)
export class AerolineaController {
  constructor(private readonly aerolineaService: AerolineaService) {}

  @Get()
  async findAll() {
    return await this.aerolineaService.findAll();
  }

  @Get(':idAerolinea')
  async findOne(@Param('idAerolinea') idAerolinea: string) {
    return await this.aerolineaService.findOne(idAerolinea);
  }

  @Post()
  async create(@Body() aerolineaDto: AerolineaDto) {
    const aerolinea: AerolineaEntity = plainToInstance(AerolineaEntity, aerolineaDto);
    return await this.aerolineaService.create(aerolinea);
  }

  @Put(':idAerolinea')
  async update(@Param('idAerolinea') idAerolinea: string, @Body() aerolineaDto: AerolineaDto) {
    const aerolinea: AerolineaEntity = plainToInstance(AerolineaEntity, aerolineaDto);
    return await this.aerolineaService.update(idAerolinea, aerolinea);
  }

  @Delete(':idAerolinea')
  @HttpCode(204)
  async delete(@Param('idAerolinea') idAerolinea: string) {
    return await this.aerolineaService.delete(idAerolinea);
  }
}
