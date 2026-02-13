import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ProdutoImagem } from './produto-imagem.entity';

@Entity('produtos')
export class Produto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 500 })
  descricao: string;

  @Column({ name: 'valor_venda', type: 'decimal', precision: 10, scale: 2 })
  valorVenda: number;

  @Column({ type: 'int', default: 0 })
  estoque: number;

  @OneToMany(() => ProdutoImagem, (imagem) => imagem.produto, {
    cascade: true,
    eager: true,
  })
  imagens: ProdutoImagem[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
