import { Body, Controller, Delete, Get, HttpCode, NotFoundException, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Public } from 'src/decorators/public.decorator';
import { PaisesService } from 'src/services/paises.service';
import { Utils } from 'src/utils/utils';

@Controller('api/v1/paises')
@ApiTags('Paises')
@ApiBearerAuth()
export class PaisesController {
  constructor(private _paisesService: PaisesService) { }
  @Get()
  @Public()
  @Throttle({ default: { limit: 100, ttl: 60000 } })

  async ObtenerPaises() {
    const paises = await this._paisesService.find({ where: { estatus: true } });
    return Utils.Response('¡Operación Exitosa!', paises);
  }
  @Get(':id')
  @Public()
  @Throttle({ default: { limit: 100, ttl: 60000 } })

  async ObtenerPais(@Param('id') id: number) {
    const pais = await this._paisesService.findOneById(id);
    if (!pais)
      throw new NotFoundException(`No se encontro el pais con id ${id}`);

    return Utils.Response('¡Operación Exitosa!', pais);
  }


}
