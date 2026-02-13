import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreatePedidoItemDto } from './create-pedido-item.dto';

export class CreatePedidoDto {
  @ApiProperty({ example: 'uuid-do-cliente' })
  @IsUUID()
  @IsNotEmpty()
  clienteId: string;

  @ApiProperty({ type: [CreatePedidoItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreatePedidoItemDto)
  itens: CreatePedidoItemDto[];
}
