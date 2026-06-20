import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Plato } from './entities/plato.entity';
import { PlatosController } from './platos.controller';
import { PlatosService } from './platos.service';

@Module({
  imports: [TypeOrmModule.forFeature([Plato])],
  controllers: [PlatosController],
  providers: [PlatosService],
  exports: [PlatosService, TypeOrmModule],
})
export class PlatosModule {}
