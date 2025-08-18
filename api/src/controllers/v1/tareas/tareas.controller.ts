import { Body, Controller, Delete, Get, HttpCode, NotFoundException, Param, ParseIntPipe, Post, Put, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import CreateTareasDTO from 'src/models/Tareas/CreateTareasDTO';
import { UpdateTareaDTO } from 'src/models/Tareas/UpdateTareaDTO';
import { TareasService } from 'src/services/tareas.service';
import { Filter } from 'src/types/filtros.type';
import { Utils } from 'src/utils/utils';

@ApiTags("tareas")
@Controller('api/v1/tareas')
export class TareasController {
    constructor(private _tareasService: TareasService) { }

    @Post("crear")
    @ApiBearerAuth()
    @HttpCode(201)
    @ApiBody({ type: CreateTareasDTO, required: true })
    async crearTarea(@Body() createTareaDTO: CreateTareasDTO, @Req() req: any) {
        const id_usuario = req.user.id;
        const tareaCreada = await this._tareasService.create({ ...createTareaDTO, id_usuario })

        return Utils.Response("¡Operación exitosa!", tareaCreada);
    }

    @Put("modificar/:id")
    @ApiBearerAuth()
    async modificarTarea(@Param("id", ParseIntPipe) id: number, @Body() updateTareaDto: UpdateTareaDTO) {
        const existe = await this._tareasService.update(id, { ...updateTareaDto });
        if (existe.length == 0) throw new NotFoundException(`No se encontro la tarea con id: ${id}`);

        return Utils.Response("¡Operación exitosa!", "¡Se modifico la tarea!")
    }

    @Delete("eliminar/:id")
    @ApiBearerAuth()
    async eliminarTarea(@Param("id", ParseIntPipe) id: number) {
        const existe = await this._tareasService.deleteWhere({ where: { id: id } })

        if (existe.length == 0) throw new NotFoundException(`No se encontro la tarea con id: ${id}`);

        return Utils.Response("¡Operación exitosa!", "¡Se elimino la tarea!")
    }

    @Put("cambiar-estado-completado/:id")
    @ApiBearerAuth()
    async cambiarCompletado(@Param("id") id: number) {
        const tarea = await this._tareasService.findOne({ where: { id } });
        const nuevoEstado = !tarea.completado;

        await this._tareasService.update(id, { completado: nuevoEstado, fecha_terminado: nuevoEstado ? new Date() : null })
        const estado = nuevoEstado ? " COMPLETADO" : "NO COMPLETADO";
        return Utils.Response("¡Operacion Exitosa!", `Se cambio la tarea al estado ${estado}`)
    }

    @HttpCode(200)
    @Post("mi-listado")
    @ApiBearerAuth()
    @Throttle({ default: { limit: 100, ttl: 60000 } })
    @ApiQuery({ name: 'pagina', required: false, type: Number })
    @ApiQuery({ name: 'limite', required: false, type: Number })
    @ApiQuery({ name: 'busqueda', required: false, type: String })
    @ApiQuery({
        name: 'prioridad',
        required: false,
        enum: ['L', 'N', 'A'],
    })
    @ApiQuery({
        name: 'estatus',
        required: false,
        enum: ['T', 'C', 'N'],
    })
    @ApiQuery({ name: 'fechaInicio', required: false, type: Date })
    @ApiQuery({ name: 'fechaFin', required: false, type: Date })
    async obtenerTareas(
        @Req() req: any,
        @Query('pagina') pagina?: number,
        @Query('limite') limite?: number,
        @Query('busqueda') busqueda?: string,
        @Query('prioridad') priorirad?: string,
        @Query('fechaInicio') fechaInicio?: Date,
        @Query('fechaFin') fechaFin?: Date,
        @Query('estatus') estatus?: string
    ) {
        const filtros: Filter[] = [{ field: "id_usuario", operator: "eq", value: req.user.id }];

        if (priorirad && priorirad !== "T") {
            const prioridadMap: Record<string, string> = { L: "LEVE", N: "NORMAL", A: "ALTA" };
            filtros.push({ field: "prioridad", operator: "eq", value: prioridadMap[priorirad] });
        }

        if (estatus && estatus !== "T") {
            filtros.push({ field: "completado", operator: "eq", value: estatus == "C" });
        }

        if (fechaInicio) filtros.push({ field: "created", operator: "gt", value: fechaInicio });
        if (fechaFin) filtros.push({ field: "created", operator: "lt", value: fechaFin });

        let data = await this._tareasService.paginate(
            pagina,
            limite,
            ['id', 'nombre', 'created', 'fecha_inicio', 'fecha_fin', 'fecha_terminado', 'prioridad', 'completado'],
            busqueda,
            [],
            [],
            filtros
        );

        const now = new Date();
        const enhancedData = data.data.map((t: any) => {
            let expirando = false;
            if (t.fecha_fin) {
                const fin = new Date(t.fecha_fin);
                const diff = fin.getTime() - now.getTime();
                expirando = diff <= 24 * 60 * 60 * 1000 && diff > 0;
            }

            let estadoCompletado = "No completada";
            if (t.completado && t.fecha_terminado) {
                estadoCompletado = new Date(t.fecha_terminado) <= new Date(t.fecha_fin || "")
                    ? "Completada a tiempo"
                    : "Completada con retraso";
            }

            return { ...t, expirando, estadoCompletado };
        });

        return Utils.Response('Operacion Exitosa', enhancedData, busqueda, data.total);
    }

    @Get("estadisticas")
    @ApiBearerAuth()
    @Throttle({ default: { limit: 50, ttl: 60000 } })

    async obtenerEstadisticas(@Req() req) {
        const id_usuario = req.user.id;
        const resultado = await this._tareasService.obtenerEstadisticas(id_usuario);
        return Utils.Response("Operación Exitosa", resultado[0]);
    }
}
