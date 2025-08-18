import { CacheInterceptor } from '@nestjs/cache-manager';
import { Controller, Get, NotFoundException, Param, UseInterceptors } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags, ApiParam } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Public } from 'src/decorators/public.decorator';
import { Generos } from 'src/entities/generos.entity';
import { GenerosService } from 'src/services/generos.service';
import { Utils } from 'src/utils/utils';

@ApiTags('Géneros')
@Controller('api/v1/generos')
export class GenerosController {
    constructor(private readonly generosService: GenerosService) { }

    /**
     * Obtener todos los géneros
     * Endpoint público, cacheado y con limitación de solicitudes
     */
    @Get('')
    @Public()
    @ApiOperation({ summary: 'Obtener géneros', description: 'Obtiene todos los géneros disponibles.' })
    @ApiOkResponse({ description: 'Listado de géneros obtenido correctamente.', type: [Generos] })
    @UseInterceptors(CacheInterceptor)
    @Throttle({ default: { limit: 100, ttl: 60000 } })
    public async ObtenerGeneros() {
        const generos = await this.generosService.find();
        return Utils.Response('¡Operación Exitosa!', generos);
    }

    /**
     * Obtener un género específico por ID
     * @param id Identificador del género
     */
    @Get(':id')
    @Public()
    @ApiOperation({ summary: 'Obtener género por ID', description: 'Obtiene un género específico por su identificador.' })
    @ApiParam({ name: 'id', type: Number, description: 'ID del género' })
    @ApiOkResponse({ description: 'Género obtenido correctamente.', type: Generos })
    @UseInterceptors(CacheInterceptor)
    @Throttle({ default: { limit: 100, ttl: 60000 } })
    public async ObtenerGenero(@Param('id') id: number) {
        const genero = await this.generosService.findOneById(id);
        if (!genero) throw new NotFoundException(`No se encontró el género con id ${id}`);
        return Utils.Response('¡Operación Exitosa!', genero);
    }
}
