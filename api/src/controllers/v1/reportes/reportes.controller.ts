import { Controller, Post, Get, Body, Req, Query, HttpCode, UseInterceptors } from '@nestjs/common';

import { RabbitMQService } from 'src/services/rabbitmq.service';
import { ReportesService } from 'src/services/reporte.service';
import { ReporteDTO } from 'src/models/Reportes/reporteDTO';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Utils } from 'src/utils/utils';
import { UrlPrefixInterceptor } from 'src/interceptors/urlPreffix.interceptor';
import { Throttle } from '@nestjs/throttler';

@ApiTags("reportes")
@Controller('api/v1/reportes')
export class ReportesController {
    constructor(
        private readonly rabbitService: RabbitMQService,
        private readonly reportesService: ReportesService,
    ) { }


    @ApiBearerAuth()
    @Post('solicitar-reporte')
    async solicitarReporte(@Req() req: any, @Body() dto: ReporteDTO) {
        const payload = {
            id_usuario: req.user.id,
            id_tipo_reporte: dto.id_tipo_reporte,
            filtros: dto.filtros || {},
        };

        const reporte = await this.reportesService.create(payload);
        await this.rabbitService.publishMessage('report_queue', { id_reporte: reporte.id });

        return Utils.Response("Operación Exitosa", "Reporte en proceso. Se generará en breve , puede Revisarlo en el apartado de descargas")
    }

    @HttpCode(200)
    @Post('listado')
    @ApiBearerAuth()
    @ApiQuery({ name: 'pagina', required: false, type: Number })
    @ApiQuery({ name: 'limite', required: false, type: Number })
    @ApiQuery({ name: 'busqueda', required: false, type: String })
    @ApiQuery({ name: 'estado', required: false, type: String })
    @UseInterceptors(new UrlPrefixInterceptor())
    @Throttle({ default: { limit: 100, ttl: 60000 } })

    async obtenerReportes(
        @Req() req: any,
        @Query('pagina') pagina = 1,
        @Query('limite') limite = 10,
        @Query('busqueda') busqueda?: string,
        @Query('estado') estado?: string,
    ) {
        const filtros: any[] = [{ field: 'id_usuario', operator: 'eq', value: req.user.id }];

        if (estado && estado != "T") {
            filtros.push({ field: 'estado', operator: 'eq', value: estado.toUpperCase() });
        }

        const data = await this.reportesService.paginate(
            pagina,
            limite,
            ['id', 'tipo.id', 'tipo.nombre', 'estado', 'created', 'updated', 'nombreArchivo'],
            busqueda,
            [],
            [{ name: 'tipo', type: 'inner' }],
            filtros,

        );

        return Utils.Response('Operación exitosa', data.data, busqueda, data.total);
    }
}
