import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Produto } from './produto.entity';

@Entity('produto_imagens')
export class ProdutoImagem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 500 })
  filename: string;

  @Column({ length: 1000 })
  path: string;

  @Column({ length: 100 })
  mimetype: string;

  @ManyToOne(() => Produto, (produto) => produto.imagens, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'produto_id' })
  produto: Produto;

  @Column({ name: 'produto_id' })
  produtoId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
