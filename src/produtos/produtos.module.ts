import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Produto } from './entities/produto.entity';
import { ProdutoImagem } from './entities/produto-imagem.entity';
import { ProdutosService } from './produtos.service';
import { ProdutosController } from './produtos.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Produto, ProdutoImagem])],
  providers: [ProdutosService],
  controllers: [ProdutosController],
  exports: [ProdutosService],
})
export class ProdutosModule {}
