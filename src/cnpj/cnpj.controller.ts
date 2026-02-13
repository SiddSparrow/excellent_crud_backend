import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CnpjService } from './cnpj.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('CNPJ')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('cnpj')
export class CnpjController {
  constructor(private readonly cnpjService: CnpjService) {}

  @Get(':cnpj')
  @ApiOperation({ summary: 'Consultar dados de CNPJ via API pública' })
  consultar(@Param('cnpj') cnpj: string) {
    return this.cnpjService.consultarCnpj(cnpj);
  }
}
