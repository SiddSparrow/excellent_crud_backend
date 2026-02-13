import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente } from './entities/cliente.entity';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { PaginatedResultDto } from '../common/dto/paginated-result.dto';

@Injectable()
export class ClientesService {
  constructor(
    @InjectRepository(Cliente)
    private readonly clientesRepository: Repository<Cliente>,
  ) {}

  async findAll(query: PaginationQueryDto): Promise<PaginatedResultDto<Cliente>> {
    const { page, limit } = query;
    const [data, total] = await this.clientesRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string): Promise<Cliente> {
    const cliente = await this.clientesRepository.findOne({ where: { id } });
    if (!cliente) {
      throw new NotFoundException(`Cliente #${id} não encontrado`);
    }
    return cliente;
  }

  async create(dto: CreateClienteDto): Promise<Cliente> {
    const existing = await this.clientesRepository.findOne({
      where: { cnpj: dto.cnpj },
    });
    if (existing) {
      throw new ConflictException('CNPJ já cadastrado');
    }
    const cliente = this.clientesRepository.create(dto);
    return this.clientesRepository.save(cliente);
  }

  async update(id: string, dto: UpdateClienteDto): Promise<Cliente> {
    const cliente = await this.findOne(id);
    Object.assign(cliente, dto);
    return this.clientesRepository.save(cliente);
  }

  async remove(id: string): Promise<void> {
    const cliente = await this.findOne(id);
    await this.clientesRepository.remove(cliente);
  }
}
