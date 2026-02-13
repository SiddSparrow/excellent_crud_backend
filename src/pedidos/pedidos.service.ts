import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Pedido } from './entities/pedido.entity';
import { PedidoItem } from './entities/pedido-item.entity';
import { Produto } from '../produtos/entities/produto.entity';
import { Cliente } from '../clientes/entities/cliente.entity';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { PaginatedResultDto } from '../common/dto/paginated-result.dto';

@Injectable()
export class PedidosService {
  constructor(
    @InjectRepository(Pedido)
    private readonly pedidosRepository: Repository<Pedido>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(
    query: PaginationQueryDto,
  ): Promise<PaginatedResultDto<Pedido>> {
    const { page, limit } = query;
    const [data, total] = await this.pedidosRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string): Promise<Pedido> {
    const pedido = await this.pedidosRepository.findOne({ where: { id } });
    if (!pedido) {
      throw new NotFoundException(`Pedido #${id} não encontrado`);
    }
    return pedido;
  }

  async create(dto: CreatePedidoDto): Promise<Pedido> {
    return this.dataSource.transaction(async (manager) => {
      // Validate client exists
      const cliente = await manager.findOne(Cliente, {
        where: { id: dto.clienteId },
      });
      if (!cliente) {
        throw new NotFoundException(
          `Cliente #${dto.clienteId} não encontrado`,
        );
      }

      const itens: PedidoItem[] = [];
      let total = 0;

      for (const itemDto of dto.itens) {
        const produto = await manager.findOne(Produto, {
          where: { id: itemDto.produtoId },
        });
        if (!produto) {
          throw new NotFoundException(
            `Produto #${itemDto.produtoId} não encontrado`,
          );
        }

        if (produto.estoque < itemDto.quantidade) {
          throw new BadRequestException(
            `Estoque insuficiente para o produto "${produto.descricao}". Disponível: ${produto.estoque}, solicitado: ${itemDto.quantidade}`,
          );
        }

        // Decrease stock
        produto.estoque -= itemDto.quantidade;
        await manager.save(Produto, produto);

        const precoUnit = Number(produto.valorVenda);
        const subtotal = precoUnit * itemDto.quantidade;
        total += subtotal;

        const item = manager.create(PedidoItem, {
          produtoId: itemDto.produtoId,
          quantidade: itemDto.quantidade,
          precoUnit,
          subtotal,
        });
        itens.push(item);
      }

      const pedido = manager.create(Pedido, {
        clienteId: dto.clienteId,
        total,
      });

      const savedPedido = await manager.save(Pedido, pedido);

      for (const item of itens) {
        item.pedidoId = savedPedido.id;
      }
      await manager.save(PedidoItem, itens);

      return this.pedidosRepository.findOne({
        where: { id: savedPedido.id },
      });
    });
  }

  async remove(id: string): Promise<void> {
    const pedido = await this.findOne(id);

    // Restore stock for each item
    await this.dataSource.transaction(async (manager) => {
      for (const item of pedido.itens) {
        const produto = await manager.findOne(Produto, {
          where: { id: item.produtoId },
        });
        if (produto) {
          produto.estoque += item.quantidade;
          await manager.save(Produto, produto);
        }
      }
      await manager.remove(Pedido, pedido);
    });
  }
}
