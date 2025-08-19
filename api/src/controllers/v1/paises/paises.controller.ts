import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Public } from 'src/decorators/public.decorator';
import { PaisesService } from 'src/services/paises.service';
import { Utils } from 'src/utils/utils';

@Controller('api/v1/paises')
@ApiTags('paises')
export class PaisesController {
  constructor(private _paisesService: PaisesService) { }

  /**
   * Obtener todos los países activos
   */
  @Get()
  @Public()
  @Throttle({ default: { limit: 100, ttl: 60000 } })
  @ApiOperation({ summary: 'Listar países', description: 'Obtiene todos los países activos.' })
  @ApiResponse({ status: 200, description: 'Listado de países obtenido correctamente.' })
  async ObtenerPaises() {
    const paises = await this._paisesService.find({ where: { estatus: true } });
    return Utils.Response('¡Operación Exitosa!', paises);
  }

  /**
   * Obtener un país específico por ID
   * @param id Identificador del país
   */
  @Get(':id')
  @Public()
  @Throttle({ default: { limit: 100, ttl: 60000 } })
  @ApiOperation({ summary: 'Obtener país por ID', description: 'Obtiene un país activo por su identificador.' })
  @ApiParam({ name: 'id', required: true, description: 'ID del país', type: Number })
  @ApiResponse({ status: 200, description: 'País obtenido correctamente.' })
  @ApiResponse({ status: 404, description: 'No se encontró el país.' })
  async ObtenerPais(@Param('id') id: number) {
    const pais = await this._paisesService.findOneById(id);
    if (!pais) throw new NotFoundException(`No se encontró el país con id ${id}`);

    return Utils.Response('¡Operación Exitosa!', pais);
  }
}
