import { CacheInterceptor } from '@nestjs/cache-manager';
import {
    Controller,
    Get,
    NotFoundException,
    Param,
    UseGuards,
} from '@nestjs/common';
import {
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Public } from 'src/decorators/public.decorator';
import { Generos } from 'src/entities/generos.entity';
import { GenerosService } from 'src/services/generos.service';
import { Utils } from 'src/utils/utils';

@ApiTags('generos')
@Controller('api/v1/generos')
export class GenerosController {
    constructor(private readonly generosService: GenerosService) { }
    @Get('')
    @Public()
    @ApiOperation({
        summary: 'ObtenerGeneros',
        description: 'Obtiene los Generos',
    })
    @ApiOkResponse({
        description: 'Regresa todos los géneros.',
        type: [Generos],
    })
    @UseGuards(CacheInterceptor)
    @Throttle({ default: { limit: 100, ttl: 60000 } })
    public async ObtenerGeneros() {
        return Utils.Response(
            '¡Operacion Exitosa!',
            await this.generosService.find(),
        );
    }
    @Get(':id')
    @Public()
    @ApiOperation({
        summary: 'ObtenerGeneros',
        description: 'Obtiene los Generos',
    })
    @ApiOkResponse({
        description: 'Regresa genero en especifico',
        type: Generos,
    })
    @UseGuards(CacheInterceptor)
    @Throttle({ default: { limit: 100, ttl: 60000 } })

    public async ObtenerGenero(@Param('id') id: number) {
        let genero = await this.generosService.findOneById(id);
        if (genero) return Utils.Response('¡Operacion Exitosa!', genero);
        throw new NotFoundException(`No se encontro el genero con id ${id}`);
    }
}
