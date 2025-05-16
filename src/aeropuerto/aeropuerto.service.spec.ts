import { Test, TestingModule } from '@nestjs/testing';
import { AeropuertoService } from './aeropuerto.service';
import { Repository } from 'typeorm';
import { AeropuertoEntity } from './aeropuerto.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { faker } from '@faker-js/faker';
import { BusinessLogicException } from '../shared/errors/business-errors';

describe('AeropuertoService', () => {
  let service: AeropuertoService;
  let repository: Repository<AeropuertoEntity>;
  let aeropuertosList: AeropuertoEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [AeropuertoService],
    }).compile();

    service = module.get<AeropuertoService>(AeropuertoService);
    repository = module.get<Repository<AeropuertoEntity>>(getRepositoryToken(AeropuertoEntity));
    await seedDatabase();
  });

  const seedDatabase = async () => {
    await repository.clear();
    aeropuertosList = [];
    for (let i = 0; i < 5; i++) {
      const aeropuerto: AeropuertoEntity = await repository.save({
        nombre: faker.location.city(),
        codigo: generateValidCode(),
        pais: faker.location.country(),
        ciudad: faker.location.city(),
        aerolineas: [],
      });
      aeropuertosList.push(aeropuerto);
    }
  };

  // Helper para generar códigos de aeropuerto válidos (3 caracteres)
  const generateValidCode = (): string => {
    return faker.string.alpha({ length: 3, casing: 'upper' });
  };

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll should return all aeropuertos', async () => {
    const aeropuertos: AeropuertoEntity[] = await service.findAll();
    expect(aeropuertos).not.toBeNull();
    expect(aeropuertos).toHaveLength(aeropuertosList.length);
  });

  it('findOne should return an aeropuerto by id', async () => {
    const storedAeropuerto: AeropuertoEntity = aeropuertosList[0];
    const aeropuerto: AeropuertoEntity = await service.findOne(storedAeropuerto.id);
    expect(aeropuerto).not.toBeNull();
    expect(aeropuerto.nombre).toEqual(storedAeropuerto.nombre);
    expect(aeropuerto.codigo).toEqual(storedAeropuerto.codigo);
    expect(aeropuerto.pais).toEqual(storedAeropuerto.pais);
    expect(aeropuerto.ciudad).toEqual(storedAeropuerto.ciudad);
  });

  it('findOne should throw an exception for an invalid aeropuerto', async () => {
    await expect(() => service.findOne(0)).rejects.toHaveProperty(
      'message',
      'The aeropuerto with the given id was not found',
    );
  });

  it('create should return a new aeropuerto', async () => {
    const aeropuerto: AeropuertoEntity = {
      id: 0,
      nombre: faker.location.city(),
      codigo: generateValidCode(),
      pais: faker.location.country(),
      ciudad: faker.location.city(),
      aerolineas: [],
    };
    const newAeropuerto: AeropuertoEntity = await service.create(aeropuerto);
    expect(newAeropuerto).not.toBeNull();
    const storedAeropuerto = await repository.findOne({
      where: { id: newAeropuerto.id },
    });
    expect(storedAeropuerto).not.toBeNull();
    expect(storedAeropuerto!.nombre).toEqual(newAeropuerto.nombre);
    expect(storedAeropuerto!.codigo).toEqual(newAeropuerto.codigo);
    expect(storedAeropuerto!.pais).toEqual(newAeropuerto.pais);
    expect(storedAeropuerto!.ciudad).toEqual(newAeropuerto.ciudad);
  });

  it('create should throw an exception for an invalid code length', async () => {
    const aeropuerto: AeropuertoEntity = {
      id: 0,
      nombre: faker.location.city(),
      codigo: 'INVALID', // Código con longitud inválida
      pais: faker.location.country(),
      ciudad: faker.location.city(),
      aerolineas: [],
    };
    await expect(() => service.create(aeropuerto)).rejects.toHaveProperty(
      'message',
      'The code must be 3 characters long',
    );
  });

  it('update should modify an aeropuerto', async () => {
    const aeropuerto: AeropuertoEntity = aeropuertosList[0];
    aeropuerto.nombre = 'New name';
    aeropuerto.codigo = 'ABC';
    aeropuerto.pais = 'New country';
    aeropuerto.ciudad = 'New city';
    const updatedAeropuerto: AeropuertoEntity = await service.update(aeropuerto.id, aeropuerto);
    expect(updatedAeropuerto).not.toBeNull();
    const storedAeropuerto = await repository.findOne({
      where: { id: aeropuerto.id },
    });
    expect(storedAeropuerto).not.toBeNull();
    expect(storedAeropuerto!.nombre).toEqual(aeropuerto.nombre);
    expect(storedAeropuerto!.codigo).toEqual(aeropuerto.codigo);
    expect(storedAeropuerto!.pais).toEqual(aeropuerto.pais);
    expect(storedAeropuerto!.ciudad).toEqual(aeropuerto.ciudad);
  });

  it('update should throw an exception for an invalid aeropuerto', async () => {
    let aeropuerto: AeropuertoEntity = aeropuertosList[0];
    aeropuerto = {
      ...aeropuerto,
      nombre: 'New name',
      codigo: 'ABC',
    };
    await expect(() => service.update(0, aeropuerto)).rejects.toHaveProperty(
      'message',
      'The aeropuerto with the given id was not found',
    );
  });

  it('update should throw an exception for an invalid code length', async () => {
    const aeropuerto: AeropuertoEntity = aeropuertosList[0];
    aeropuerto.codigo = 'INVALID'; // Código con longitud inválida

    await expect(() => service.update(aeropuerto.id, aeropuerto)).rejects.toHaveProperty(
      'message',
      'The code must be 3 characters long',
    );
  });

  it('delete should remove an aeropuerto', async () => {
    const aeropuerto: AeropuertoEntity = aeropuertosList[0];
    await service.delete(aeropuerto.id);
    const deletedAeropuerto = await repository.findOne({
      where: { id: aeropuerto.id },
    });
    expect(deletedAeropuerto).toBeNull();
  });

  it('delete should throw an exception for an invalid aeropuerto', async () => {
    await expect(() => service.delete(0)).rejects.toHaveProperty(
      'message',
      'The aeropuerto with the given id was not found',
    );
  });

  it('validateCodeCharacters should return true for valid codes', () => {
    const validCode = 'ABC';
    expect(service.validateCodeCharacters(validCode)).toBeTruthy();
  });

  it('validateCodeCharacters should throw an exception for invalid code length', () => {
    const invalidCode = 'ABCD';
    expect(() => service.validateCodeCharacters(invalidCode)).toThrow(BusinessLogicException);
    expect(() => service.validateCodeCharacters(invalidCode)).toThrow(
      'The code must be 3 characters long',
    );
  });
});
