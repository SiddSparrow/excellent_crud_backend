import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateClienteDto {
  @ApiProperty({ example: 'Empresa XYZ Ltda' })
  @IsString()
  @IsNotEmpty()
  razaoSocial: string;

  @ApiProperty({ example: '12.345.678/0001-99' })
  @IsString()
  @IsNotEmpty()
  cnpj: string;

  @ApiProperty({ example: 'contato@empresa.com' })
  @IsEmail()
  email: string;
}
