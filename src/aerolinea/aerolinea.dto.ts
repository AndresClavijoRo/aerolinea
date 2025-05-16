import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsString } from 'class-validator';

export class AerolineaDto {
  @IsString()
  @IsNotEmpty()
  readonly nombre: string;

  @IsString()
  @IsNotEmpty()
  readonly descripcion: string;

  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  readonly fechaFundacion: Date;

  @IsString()
  @IsNotEmpty()
  paginaWeb: string;
}
