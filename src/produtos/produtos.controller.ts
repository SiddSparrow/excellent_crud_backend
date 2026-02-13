import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ProdutosService } from './produtos.service';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';

@ApiTags('Produtos')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('produtos')
export class ProdutosController {
  constructor(private readonly produtosService: ProdutosService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os produtos (paginado)' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.produtosService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar produto por ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.produtosService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Criar novo produto' })
  create(@Body() dto: CreateProdutoDto) {
    return this.produtosService.create(dto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Atualizar produto' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProdutoDto,
  ) {
    return this.produtosService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Remover produto' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.produtosService.remove(id);
  }

  @Post(':id/imagens')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Upload de imagens do produto' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FilesInterceptor('imagens', 10, {
      storage: diskStorage({
        destination: './uploads/produtos',
        filename: (_req, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${uuidv4()}`;
          const ext = extname(file.originalname);
          cb(null, `${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          cb(new BadRequestException('Apenas arquivos de imagem são permitidos'), false);
          return;
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  uploadImages(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.produtosService.uploadImages(id, files);
  }

  @Delete(':id/imagens/:imagemId')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Remover imagem do produto' })
  removeImage(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('imagemId', ParseUUIDPipe) imagemId: string,
  ) {
    return this.produtosService.removeImage(id, imagemId);
  }
}
