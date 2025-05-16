import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AeropuertoEntity } from './aeropuerto.entity';
import { Repository } from 'typeorm';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';

@Injectable()
export class AeropuertoService {
  constructor(
    @InjectRepository(AeropuertoEntity)
    private readonly aerolineaRepository: Repository<AeropuertoEntity>,
  ) {}

  async findAll(): Promise<AeropuertoEntity[]> {
    return await this.aerolineaRepository.find({
      relations: ['aerolineas'],
    });
  }

  async findOne(id: number): Promise<AeropuertoEntity> {
    const aeropuerto = await this.aerolineaRepository.findOne({
      where: { id },
      relations: ['aerolineas'],
    });
    if (!aeropuerto)
      throw new BusinessLogicException(
        'The aeropuerto with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    return aeropuerto;
  }

  async create(aeropuerto: AeropuertoEntity): Promise<AeropuertoEntity> {
    this.validateCodeCharacters(aeropuerto.codigo);
    return await this.aerolineaRepository.save(aeropuerto);
  }

  async update(id: number, aeropuerto: AeropuertoEntity): Promise<AeropuertoEntity> {
    const aeropuertoFinded = await this.findOne(id);
    this.validateCodeCharacters(aeropuerto.codigo);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: aerolineaId, ...aeropuertoToUpdate } = aeropuerto;
    return await this.aerolineaRepository.save({
      ...aeropuertoFinded,
      ...aeropuertoToUpdate,
    });
  }

  async delete(id: number) {
    const aeropuertoFinded = await this.findOne(id);
    await this.aerolineaRepository.remove(aeropuertoFinded);
  }

  validateCodeCharacters(code: string): boolean {
    const regex = /^.{3}$/;
    if (!regex.test(code)) {
      throw new BusinessLogicException(
        'The code must be 3 characters long',
        BusinessError.BAD_REQUEST,
      );
    }
    return true;
  }
}
