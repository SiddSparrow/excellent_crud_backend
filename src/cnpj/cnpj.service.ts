import {
  BadGatewayException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface CnpjResponse {
  cnpj: string;
  razaoSocial: string;
  email: string;
}

@Injectable()
export class CnpjService {
  constructor(private readonly httpService: HttpService) {}

  async consultarCnpj(cnpj: string): Promise<CnpjResponse> {
    const cnpjLimpo = cnpj.replace(/\D/g, '');
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`/cnpj/${cnpjLimpo}`),
      );
      return {
        cnpj: data.estabelecimento?.cnpj || cnpjLimpo,
        razaoSocial: data.razao_social || '',
        email: data.estabelecimento?.email || '',
      };
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new NotFoundException('CNPJ não encontrado');
      }
      if (error.response?.status === 429) {
        throw new HttpException(
          'Limite de consultas à API de CNPJ excedido',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
      throw new BadGatewayException('Falha ao consultar API de CNPJ');
    }
  }
}
