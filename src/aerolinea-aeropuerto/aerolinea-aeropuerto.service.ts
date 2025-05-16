import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AerolineaEntity } from '../aerolinea/aerolinea.entity';
import { AeropuertoEntity } from '../aeropuerto/aeropuerto.entity';
import { Repository } from 'typeorm';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';

@Injectable()
export class AerolineaAeropuertoService {
  constructor(
    @InjectRepository(AerolineaEntity)
    private readonly aerolineaRepository: Repository<AerolineaEntity>,

    @InjectRepository(AeropuertoEntity)
    private readonly aeropuertoRepository: Repository<AeropuertoEntity>,
  ) {}

  async addAirportToAirline(aeropuertoId: number, aerolineaId: number): Promise<AerolineaEntity> {
    const aeropuerto = await this.aeropuertoRepository.findOne({
      where: { id: aeropuertoId },
    });

    if (!aeropuerto) {
      throw new BusinessLogicException(
        'The aeropuerto with the provided id does not exist',
        BusinessError.NOT_FOUND,
      );
    }

    const aerolinea = await this.aerolineaRepository.findOne({
      where: { id: aerolineaId },
      relations: ['aeropuertos'],
    });

    if (!aerolinea) {
      throw new BusinessLogicException(
        'The aerolinea with the provided id does not exist',
        BusinessError.NOT_FOUND,
      );
    }

    aerolinea.aeropuertos.push(aeropuerto);
    return await this.aerolineaRepository.save(aerolinea);
  }

  async findAirportsFromAirline(aerolineaId: number): Promise<AeropuertoEntity[]> {
    const aerolinea = await this.aerolineaRepository.findOne({
      where: { id: aerolineaId },
      relations: ['aeropuertos'],
    });

    if (!aerolinea) {
      throw new BusinessLogicException(
        'The aerolinea with the provided id does not exist',
        BusinessError.NOT_FOUND,
      );
    }

    return aerolinea.aeropuertos;
  }

  async findAirportFromAirline(
    aeropuertoId: number,
    aerolineaId: number,
  ): Promise<AeropuertoEntity> {
    const aeropuerto = await this.aeropuertoRepository.findOne({
      where: { id: aeropuertoId },
      relations: ['aerolineas'],
    });

    if (!aeropuerto) {
      throw new BusinessLogicException(
        'The aeropuerto with the provided id does not exist',
        BusinessError.NOT_FOUND,
      );
    }

    const aerolinea = await this.aerolineaRepository.findOne({
      where: { id: aerolineaId },
      relations: ['aeropuertos'],
    });

    if (!aerolinea) {
      throw new BusinessLogicException(
        'The aerolinea with the provided id does not exist',
        BusinessError.NOT_FOUND,
      );
    }

    if (!aeropuerto.aerolineas.some((aerolinea) => aerolinea.id === aerolineaId)) {
      throw new BusinessLogicException(
        'The aeropuerto is not associated with the aerolinea',
        BusinessError.PRECONDITION_FAILED,
      );
    }

    return aeropuerto;
  }

  async updateAirportsFromAirline(
    aerolineaId: number,
    aeropuertos: AeropuertoEntity[],
  ): Promise<AerolineaEntity> {
    const aerolinea = await this.aerolineaRepository.findOne({
      where: { id: aerolineaId },
      relations: ['aeropuertos'],
    });

    if (!aerolinea) {
      throw new BusinessLogicException(
        'The aerolinea with the provided id does not exist',
        BusinessError.NOT_FOUND,
      );
    }

    for (const aeropuerto of aeropuertos) {
      const existingAeropuerto = await this.aeropuertoRepository.findOne({
        where: { id: aeropuerto.id },
      });

      if (!existingAeropuerto) {
        throw new BusinessLogicException(
          'The aeropuerto with the provided id does not exist',
          BusinessError.NOT_FOUND,
        );
      }
    }

    aerolinea.aeropuertos = aeropuertos;
    return await this.aerolineaRepository.save(aerolinea);
  }

  async deleteAirportFromAirline(aeropuertoId: number, aerolineaId: number): Promise<void> {
    const aeropuerto = await this.aeropuertoRepository.findOne({
      where: { id: aeropuertoId },
      relations: ['aerolineas'],
    });

    if (!aeropuerto) {
      throw new BusinessLogicException(
        'The aeropuerto with the provided id does not exist',
        BusinessError.NOT_FOUND,
      );
    }

    const aerolinea = await this.aerolineaRepository.findOne({
      where: { id: aerolineaId },
      relations: ['aeropuertos'],
    });

    if (!aerolinea) {
      throw new BusinessLogicException(
        'The aerolinea with the provided id does not exist',
        BusinessError.NOT_FOUND,
      );
    }

    if (!aeropuerto.aerolineas.some((aerolinea) => aerolinea.id === aerolineaId)) {
      throw new BusinessLogicException(
        'The aeropuerto is not associated with the aerolinea',
        BusinessError.PRECONDITION_FAILED,
      );
    }

    aeropuerto.aerolineas = aeropuerto.aerolineas.filter(
      (aerolinea) => aerolinea.id !== aerolineaId,
    );

    await this.aeropuertoRepository.save(aeropuerto);
  }
}
