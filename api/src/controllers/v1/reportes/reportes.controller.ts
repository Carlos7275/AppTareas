import { Controller, Post, Get, Body, Req, Query, HttpCode, UseInterceptors } from '@nestjs/common';
import { RabbitMQService } from 'src/services/rabbitmq.service';
import { ReportesService } from 'src/services/reporte.service';
import { ReporteDTO } from 'src/models/Reportes/reporteDTO';
import { ApiBearerAuth, ApiQuery, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
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

    /**
     * Solicita la generación de un reporte.
     * Envía la información a la cola RabbitMQ para procesamiento asincrónico.
     */
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Solicitar generación de reporte', description: 'Crea un reporte y lo envía a la cola de procesamiento.' })
    @ApiResponse({ status: 200, description: 'Reporte solicitado correctamente.' })
    @ApiResponse({ status: 401, description: 'Usuario no autorizado.' })
    @Post('solicitar-reporte')
    async solicitarReporte(@Req() req: any, @Body() dto: ReporteDTO) {
        const payload = {
            id_usuario: req.user.id,
            id_tipo_reporte: dto.id_tipo_reporte,
            filtros: dto.filtros || {},
        };

        const reporte = await this.reportesService.create(payload);

        await this.rabbitService.publishMessage('report_queue', { id_reporte: reporte.id });

        return Utils.Response(
            "Operación Exitosa",
            "El reporte está en proceso y estará disponible pronto en la sección de descargas."
        );
    }

    /**
     * Obtiene un listado paginado de reportes del usuario.
     * Se pueden aplicar filtros de búsqueda y estado.
     */
    @HttpCode(200)
    @Post('listado')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Listado de reportes', description: 'Obtiene un listado de reportes filtrado y paginado.' })
    @ApiQuery({ name: 'pagina', required: false, type: Number, description: 'Número de página para la paginación (default 1)' })
    @ApiQuery({ name: 'limite', required: false, type: Number, description: 'Cantidad de elementos por página (default 10)' })
    @ApiQuery({ name: 'busqueda', required: false, type: String, description: 'Término de búsqueda para filtrar reportes' })
    @ApiQuery({ name: 'estado', required: false, type: String, description: 'Estado del reporte: P (pendiente), C (completado), T (todos)' })
    @ApiResponse({ status: 200, description: 'Listado obtenido correctamente.' })
    @ApiResponse({ status: 401, description: 'Usuario no autorizado.' })
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

        if (estado && estado.toUpperCase() !== "T") {
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
