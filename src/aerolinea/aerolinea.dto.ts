import { IsNotEmpty, IsString } from 'class-validator';

export class AerolineaDto {
  @IsString()
  @IsNotEmpty()
  readonly nombre: string;

  @IsString()
  @IsNotEmpty()
  readonly descripcion: string;

  @IsString()
  @IsNotEmpty()
  readonly fechaFundacion: Date;

  @IsString()
  @IsNotEmpty()
  paginaWeb: string;
}
