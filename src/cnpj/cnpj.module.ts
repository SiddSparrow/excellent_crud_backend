import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CnpjService } from './cnpj.service';
import { CnpjController } from './cnpj.controller';

@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,
      baseURL: 'https://publica.cnpj.ws',
    }),
  ],
  providers: [CnpjService],
  controllers: [CnpjController],
  exports: [CnpjService],
})
export class CnpjModule {}
