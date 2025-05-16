import { Test, TestingModule } from '@nestjs/testing';
import { AerolineaService } from './aerolinea.service';
import { Repository } from 'typeorm';
import { AerolineaEntity } from './aerolinea.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { faker } from '@faker-js/faker';
import { BusinessLogicException } from '../shared/errors/business-errors';

describe('AerolineaService', () => {
  let service: AerolineaService;
  let repository: Repository<AerolineaEntity>;
  let aerolineasList: AerolineaEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [AerolineaService],
    }).compile();

    service = module.get<AerolineaService>(AerolineaService);
    repository = module.get<Repository<AerolineaEntity>>(getRepositoryToken(AerolineaEntity));
    await seedDatabase();
  });

  const seedDatabase = async () => {
    await repository.clear();
    aerolineasList = [];
    for (let i = 0; i < 5; i++) {
      const aerolinea: AerolineaEntity = await repository.save({
        nombre: faker.company.name(),
        descripcion: faker.lorem.paragraph(),
        fechaFundacion: faker.date.past(),
        paginaWeb: faker.internet.url(),
        aeropuertos: [],
      });
      aerolineasList.push(aerolinea);
    }
  };

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll should return all aerolineas', async () => {
    const aerolineas: AerolineaEntity[] = await service.findAll();
    expect(aerolineas).not.toBeNull();
    expect(aerolineas).toHaveLength(aerolineasList.length);
  });

  it('findOne should return an aerolinea by id', async () => {
    const storedAerolinea: AerolineaEntity = aerolineasList[0];
    const aerolinea: AerolineaEntity = await service.findOne(storedAerolinea.id);
    expect(aerolinea).not.toBeNull();
    expect(aerolinea.nombre).toEqual(storedAerolinea.nombre);
    expect(aerolinea.descripcion).toEqual(storedAerolinea.descripcion);
    expect(aerolinea.fechaFundacion).toEqual(storedAerolinea.fechaFundacion);
    expect(aerolinea.paginaWeb).toEqual(storedAerolinea.paginaWeb);
  });

  it('findOne should throw an exception for an invalid aerolinea', async () => {
    await expect(() => service.findOne(0)).rejects.toHaveProperty(
      'message',
      'The aerolinea with the given id was not found',
    );
  });

  it('create should return a new aerolinea', async () => {
    const pastDate = faker.date.past();
    const aerolinea: AerolineaEntity = {
      id: 0,
      nombre: faker.company.name(),
      descripcion: faker.lorem.paragraph(),
      fechaFundacion: pastDate,
      paginaWeb: faker.internet.url(),
      aeropuertos: [],
    };
    const newAerolinea: AerolineaEntity = await service.create(aerolinea);
    expect(newAerolinea).not.toBeNull();
    const storedAerolinea = await repository.findOne({
      where: { id: newAerolinea.id },
    });
    expect(storedAerolinea!).not.toBeNull();
    expect(storedAerolinea!.nombre).toEqual(newAerolinea.nombre);
    expect(storedAerolinea!.descripcion).toEqual(newAerolinea.descripcion);
    expect(storedAerolinea!.fechaFundacion).toEqual(newAerolinea.fechaFundacion);
    expect(storedAerolinea!.paginaWeb).toEqual(newAerolinea.paginaWeb);
  });

  it('create should throw an exception for a future foundation date', async () => {
    const futureDate = faker.date.future();
    const aerolinea: AerolineaEntity = {
      id: 0,
      nombre: faker.company.name(),
      descripcion: faker.lorem.paragraph(),
      fechaFundacion: futureDate,
      paginaWeb: faker.internet.url(),
      aeropuertos: [],
    };
    await expect(() => service.create(aerolinea)).rejects.toHaveProperty(
      'message',
      'The foundation date must be in the past',
    );
  });

  it('update should modify an aerolinea', async () => {
    const aerolinea: AerolineaEntity = aerolineasList[0];
    const pastDate = faker.date.past();
    aerolinea.nombre = 'New name';
    aerolinea.descripcion = 'New description';
    aerolinea.fechaFundacion = pastDate;
    aerolinea.paginaWeb = 'https://www.newurl.com';
    const updatedAerolinea: AerolineaEntity = await service.update(aerolinea.id, aerolinea);
    expect(updatedAerolinea).not.toBeNull();
    const storedAerolinea = await repository.findOne({
      where: { id: aerolinea.id },
    });
    expect(storedAerolinea).not.toBeNull();
    expect(storedAerolinea!.nombre).toEqual(aerolinea.nombre);
    expect(storedAerolinea!.descripcion).toEqual(aerolinea.descripcion);
    expect(storedAerolinea!.fechaFundacion).toEqual(aerolinea.fechaFundacion);
    expect(storedAerolinea!.paginaWeb).toEqual(aerolinea.paginaWeb);
  });

  it('update should throw an exception for an invalid aerolinea', async () => {
    let aerolinea: AerolineaEntity = aerolineasList[0];
    aerolinea = {
      ...aerolinea,
      nombre: 'New name',
      descripcion: 'New description',
    };
    await expect(() => service.update(0, aerolinea)).rejects.toHaveProperty(
      'message',
      'The aerolinea with the given id was not found',
    );
  });

  it('update should throw an exception for a future foundation date', async () => {
    const aerolinea: AerolineaEntity = aerolineasList[0];
    const futureDate = faker.date.future();
    aerolinea.fechaFundacion = futureDate;

    await expect(() => service.update(aerolinea.id, aerolinea)).rejects.toHaveProperty(
      'message',
      'The foundation date must be in the past',
    );
  });

  it('delete should remove an aerolinea', async () => {
    const aerolinea: AerolineaEntity = aerolineasList[0];
    await service.delete(aerolinea.id);
    const deletedAerolinea = await repository.findOne({
      where: { id: aerolinea.id },
    });
    expect(deletedAerolinea).toBeNull();
  });

  it('delete should throw an exception for an invalid aerolinea', async () => {
    await expect(() => service.delete(0)).rejects.toHaveProperty(
      'message',
      'The aerolinea with the given id was not found',
    );
  });

  it('validateDateInPast should return true for past dates', () => {
    const pastDate = faker.date.past();
    expect(service.validateDateInPast(pastDate)).toBeTruthy();
  });

  it('validateDateInPast should throw an exception for future dates', () => {
    const futureDate = faker.date.future();
    expect(() => service.validateDateInPast(futureDate)).toThrow(BusinessLogicException);
    expect(() => service.validateDateInPast(futureDate)).toThrow(
      'The foundation date must be in the past',
    );
  });
});
