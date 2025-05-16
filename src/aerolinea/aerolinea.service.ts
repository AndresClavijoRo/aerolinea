import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AerolineaEntity } from './aerolinea.entity';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';

@Injectable()
export class AerolineaService {
  constructor(
    @InjectRepository(AerolineaEntity)
    private readonly aerolineaRepository: Repository<AerolineaEntity>,
  ) {}

  async findAll(): Promise<AerolineaEntity[]> {
    return await this.aerolineaRepository.find({
      relations: ['aeropuertos'],
    });
  }
  async findOne(id: number): Promise<AerolineaEntity> {
    const aerolinea = await this.aerolineaRepository.findOne({
      where: { id },
      relations: ['aeropuertos'],
    });

    if (!aerolinea)
      throw new BusinessLogicException(
        'The aerolinea with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    return aerolinea;
  }

  async create(aerolinea: AerolineaEntity): Promise<AerolineaEntity> {
    this.validateDateInPast(aerolinea.fechaFundacion);
    return await this.aerolineaRepository.save(aerolinea);
  }

  async update(id: number, aerolinea: AerolineaEntity): Promise<AerolineaEntity> {
    const aerolineaFinded = await this.findOne(id);

    this.validateDateInPast(aerolinea.fechaFundacion);

    return await this.aerolineaRepository.save({
      ...aerolineaFinded,
      ...aerolinea,
    });
  }

  async delete(id: number) {
    const aerolineaFinded = await this.findOne(id);
    await this.aerolineaRepository.remove(aerolineaFinded);
  }

  validateDateInPast(date: Date): boolean {
    const currentDate = new Date();
    if (date > currentDate) {
      throw new BusinessLogicException(
        'The foundation date must be in the past',
        BusinessError.BAD_REQUEST,
      );
    }
    return true;
  }
}
