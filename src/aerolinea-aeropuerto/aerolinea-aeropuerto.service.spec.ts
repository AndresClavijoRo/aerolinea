import { faker } from '@faker-js/faker';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AerolineaEntity } from '../aerolinea/aerolinea.entity';
import { AeropuertoEntity } from '../aeropuerto/aeropuerto.entity';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { AerolineaAeropuertoService } from './aerolinea-aeropuerto.service';

describe('AerolineaAeropuertoService', () => {
  let service: AerolineaAeropuertoService;
  let aeropuertoRepository: Repository<AeropuertoEntity>;
  let aerolineaRepository: Repository<AerolineaEntity>;
  let aeropuerto: AeropuertoEntity;
  let aerolinea: AerolineaEntity;
  let aeropuertosList: AeropuertoEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [AerolineaAeropuertoService],
    }).compile();

    service = module.get<AerolineaAeropuertoService>(AerolineaAeropuertoService);
    aeropuertoRepository = module.get<Repository<AeropuertoEntity>>(
      getRepositoryToken(AeropuertoEntity),
    );
    aerolineaRepository = module.get<Repository<AerolineaEntity>>(
      getRepositoryToken(AerolineaEntity),
    );

    await seedDatabase();
  });

  const seedDatabase = async () => {
    await aeropuertoRepository.clear();
    await aerolineaRepository.clear();

    aeropuertosList = [];
    for (let i = 0; i < 5; i++) {
      const aeropuerto = await aeropuertoRepository.save({
        nombre: faker.location.city(),
        codigo: faker.string.alpha({ length: 3, casing: 'upper' }),
        pais: faker.location.country(),
        ciudad: faker.location.city(),
        aerolineas: [],
      });
      aeropuertosList.push(aeropuerto);
    }

    // Aeropuerto principal para pruebas
    aeropuerto = aeropuertosList[0];

    // Crear una aerolínea para pruebas
    aerolinea = await aerolineaRepository.save({
      nombre: faker.company.name(),
      descripcion: faker.lorem.paragraph(),
      fechaFundacion: faker.date.past(),
      paginaWeb: faker.internet.url(),
      aeropuertos: [],
    });
  };

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('addAirportToAirline should add an airport to an airline', async () => {
    const result = await service.addAirportToAirline(aeropuerto.id, aerolinea.id);

    expect(result).not.toBeNull();
    expect(result.aeropuertos.length).toBe(1);
    expect(result.aeropuertos[0].id).toBe(aeropuerto.id);

    // Verificar directamente en la base de datos
    const storedAerolinea = await aerolineaRepository.findOne({
      where: { id: aerolinea.id },
      relations: ['aeropuertos'],
    });
    expect(storedAerolinea!.aeropuertos.length).toBe(1);
    expect(storedAerolinea!.aeropuertos[0].id).toBe(aeropuerto.id);
  });

  it('addAirportToAirline should throw an exception for an invalid airport', async () => {
    await expect(() => service.addAirportToAirline('0', aerolinea.id)).rejects.toHaveProperty(
      'message',
      'The aeropuerto with the provided id does not exist',
    );
  });

  it('addAirportToAirline should throw an exception for an invalid airline', async () => {
    await expect(() => service.addAirportToAirline(aeropuerto.id, '0')).rejects.toHaveProperty(
      'message',
      'The aerolinea with the provided id does not exist',
    );
  });

  it('findAirportsFromAirline should return airports from an airline', async () => {
    // Primero añadimos un aeropuerto a la aerolínea
    await service.addAirportToAirline(aeropuerto.id, aerolinea.id);

    const result = await service.findAirportsFromAirline(aerolinea.id);

    expect(result).not.toBeNull();
    expect(result.length).toBe(1);
    expect(result[0].id).toBe(aeropuerto.id);
  });

  it('findAirportsFromAirline should throw an exception for an invalid airline', async () => {
    await expect(() => service.findAirportsFromAirline('0')).rejects.toHaveProperty(
      'message',
      'The aerolinea with the provided id does not exist',
    );
  });

  it('findAirportFromAirline should return an airport from an airline', async () => {
    // Primero añadimos un aeropuerto a la aerolínea
    await service.addAirportToAirline(aeropuerto.id, aerolinea.id);

    const result = await service.findAirportFromAirline(aeropuerto.id, aerolinea.id);

    expect(result).not.toBeNull();
    expect(result.id).toBe(aeropuerto.id);
  });

  it('findAirportFromAirline should throw an exception for an invalid airport', async () => {
    await expect(() => service.findAirportFromAirline('0', aerolinea.id)).rejects.toHaveProperty(
      'message',
      'The aeropuerto with the provided id does not exist',
    );
  });

  it('findAirportFromAirline should throw an exception for an invalid airline', async () => {
    await expect(() => service.findAirportFromAirline(aeropuerto.id, '0')).rejects.toHaveProperty(
      'message',
      'The aerolinea with the provided id does not exist',
    );
  });

  it('findAirportFromAirline should throw an exception when airport is not associated with airline', async () => {
    // No asociamos el aeropuerto con la aerolínea

    await expect(() =>
      service.findAirportFromAirline(aeropuerto.id, aerolinea.id),
    ).rejects.toHaveProperty('message', 'The aeropuerto is not associated with the aerolinea');
  });

  it('updateAirportsFromAirline should update airports list of an airline', async () => {
    // Seleccionamos tres aeropuertos para asociar
    const selectedAeropuertos = aeropuertosList.slice(0, 3);

    const result = await service.updateAirportsFromAirline(aerolinea.id, selectedAeropuertos);

    expect(result).not.toBeNull();
    expect(result.aeropuertos.length).toBe(3);
    expect(result.aeropuertos.map((a) => a.id).sort()).toEqual(
      selectedAeropuertos.map((a) => a.id).sort(),
    );

    // Verificar directamente en la base de datos
    const storedAerolinea = await aerolineaRepository.findOne({
      where: { id: aerolinea.id },
      relations: ['aeropuertos'],
    });
    expect(storedAerolinea!.aeropuertos.length).toBe(3);
    expect(storedAerolinea!.aeropuertos.map((a) => a.id).sort()).toEqual(
      selectedAeropuertos.map((a) => a.id).sort(),
    );
  });

  it('updateAirportsFromAirline should throw an exception for an invalid airline', async () => {
    const selectedAeropuertos = aeropuertosList.slice(0, 2);

    await expect(() =>
      service.updateAirportsFromAirline('0', selectedAeropuertos),
    ).rejects.toHaveProperty('message', 'The aerolinea with the provided id does not exist');
  });

  it('updateAirportsFromAirline should throw an exception for an invalid airport', async () => {
    // Crear un aeropuerto con ID inválido
    const invalidAeropuerto = {
      id: '0',
      nombre: 'Invalid Airport',
      codigo: 'INV',
      pais: 'Invalid Country',
      ciudad: 'Invalid City',
      aerolineas: [],
    };

    await expect(() =>
      service.updateAirportsFromAirline(aerolinea.id, [invalidAeropuerto as AeropuertoEntity]),
    ).rejects.toHaveProperty('message', 'The aeropuerto with the provided id does not exist');
  });

  it('deleteAirportFromAirline should remove an airport from an airline', async () => {
    // Primero añadimos un aeropuerto a la aerolínea
    await service.addAirportToAirline(aeropuerto.id, aerolinea.id);

    // Verificamos que se haya añadido correctamente
    let storedAeropuerto = await aeropuertoRepository.findOne({
      where: { id: aeropuerto.id },
      relations: ['aerolineas'],
    });
    expect(storedAeropuerto!.aerolineas.length).toBe(1);

    // Ahora eliminamos el aeropuerto de la aerolínea
    await service.deleteAirportFromAirline(aeropuerto.id, aerolinea.id);

    // Verificamos que se haya eliminado la relación
    storedAeropuerto = await aeropuertoRepository.findOne({
      where: { id: aeropuerto.id },
      relations: ['aerolineas'],
    });
    expect(storedAeropuerto!.aerolineas.length).toBe(0);
  });

  it('deleteAirportFromAirline should throw an exception for an invalid airport', async () => {
    await expect(() => service.deleteAirportFromAirline('0', aerolinea.id)).rejects.toHaveProperty(
      'message',
      'The aeropuerto with the provided id does not exist',
    );
  });

  it('deleteAirportFromAirline should throw an exception for an invalid airline', async () => {
    await expect(() => service.deleteAirportFromAirline(aeropuerto.id, '0')).rejects.toHaveProperty(
      'message',
      'The aerolinea with the provided id does not exist',
    );
  });

  it('deleteAirportFromAirline should throw an exception when airport is not associated with airline', async () => {
    // No asociamos el aeropuerto con la aerolínea

    await expect(() =>
      service.deleteAirportFromAirline(aeropuerto.id, aerolinea.id),
    ).rejects.toHaveProperty('message', 'The aeropuerto is not associated with the aerolinea');
  });
});
