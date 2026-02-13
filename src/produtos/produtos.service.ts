import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Produto } from './entities/produto.entity';
import { ProdutoImagem } from './entities/produto-imagem.entity';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { PaginatedResultDto } from '../common/dto/paginated-result.dto';

@Injectable()
export class ProdutosService {
  constructor(
    @InjectRepository(Produto)
    private readonly produtosRepository: Repository<Produto>,
    @InjectRepository(ProdutoImagem)
    private readonly imagensRepository: Repository<ProdutoImagem>,
  ) {}

  async findAll(
    query: PaginationQueryDto,
  ): Promise<PaginatedResultDto<Produto>> {
    const { page, limit } = query;
    const [data, total] = await this.produtosRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string): Promise<Produto> {
    const produto = await this.produtosRepository.findOne({ where: { id } });
    if (!produto) {
      throw new NotFoundException(`Produto #${id} não encontrado`);
    }
    return produto;
  }

  async create(dto: CreateProdutoDto): Promise<Produto> {
    const produto = this.produtosRepository.create(dto);
    return this.produtosRepository.save(produto);
  }

  async update(id: string, dto: UpdateProdutoDto): Promise<Produto> {
    const produto = await this.findOne(id);
    Object.assign(produto, dto);
    return this.produtosRepository.save(produto);
  }

  async remove(id: string): Promise<void> {
    const produto = await this.findOne(id);

    // Remove physical image files
    if (produto.imagens?.length) {
      for (const imagem of produto.imagens) {
        const filePath = path.join(
          __dirname,
          '..',
          '..',
          'uploads',
          'produtos',
          imagem.filename,
        );
        try {
          await fs.unlink(filePath);
        } catch {
          // File may not exist, ignore
        }
      }
    }

    await this.produtosRepository.remove(produto);
  }

  async uploadImages(
    id: string,
    files: Express.Multer.File[],
  ): Promise<ProdutoImagem[]> {
    const produto = await this.findOne(id);

    const imagens = files.map((file) =>
      this.imagensRepository.create({
        filename: file.filename,
        path: `uploads/produtos/${file.filename}`,
        mimetype: file.mimetype,
        produto,
      }),
    );

    return this.imagensRepository.save(imagens);
  }

  async removeImage(id: string, imagemId: string): Promise<void> {
    const imagem = await this.imagensRepository.findOne({
      where: { id: imagemId, produtoId: id },
    });
    if (!imagem) {
      throw new NotFoundException(`Imagem #${imagemId} não encontrada`);
    }

    const filePath = path.join(
      __dirname,
      '..',
      '..',
      'uploads',
      'produtos',
      imagem.filename,
    );
    try {
      await fs.unlink(filePath);
    } catch {
      // File may not exist
    }

    await this.imagensRepository.remove(imagem);
  }
}
