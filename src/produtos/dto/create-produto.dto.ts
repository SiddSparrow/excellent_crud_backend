import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateProdutoDto {
  @ApiProperty({ example: 'Notebook Dell Inspiron' })
  @IsString()
  @IsNotEmpty()
  descricao: string;

  @ApiProperty({ example: 3500.0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  valorVenda: number;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(0)
  estoque: number;
}
