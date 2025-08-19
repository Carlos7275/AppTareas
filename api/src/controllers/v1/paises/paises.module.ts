import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from 'src/shared/common.module';
import { Paises } from 'src/entities/paises.entity';
import { PaisesController } from './paises.controller';
import { PaisesService } from 'src/services/paises.service';

@Module({
  imports: [TypeOrmModule.forFeature([Paises]), CommonModule],
  controllers: [PaisesController],
  providers: [PaisesService],
})
export class PaisesModule {}
