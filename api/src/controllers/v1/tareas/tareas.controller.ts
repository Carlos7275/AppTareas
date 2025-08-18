import { Body, Controller, Delete, Get, HttpCode, NotFoundException, Param, ParseIntPipe, Post, Put, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiQuery, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
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

    /**
     * Crear una nueva tarea asignada al usuario autenticado
     */
    @Post("crear")
    @ApiBearerAuth()
    @HttpCode(201)
    @ApiOperation({ summary: 'Crear tarea', description: 'Crea una nueva tarea para el usuario autenticado.' })
    @ApiBody({ type: CreateTareasDTO, required: true })
    @ApiResponse({ status: 201, description: 'Tarea creada correctamente.' })
    @ApiResponse({ status: 401, description: 'Usuario no autorizado.' })
    async crearTarea(@Body() createTareaDTO: CreateTareasDTO, @Req() req: any) {
        const id_usuario = req.user.id;
        const tareaCreada = await this._tareasService.create({ ...createTareaDTO, id_usuario });
        return Utils.Response("¡Operación exitosa!", tareaCreada);
    }

    /**
     * Modificar los datos de una tarea existente
     */
    @Put("modificar/:id")
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Modificar tarea', description: 'Actualiza los datos de una tarea existente.' })
    @ApiResponse({ status: 200, description: 'Tarea modificada correctamente.' })
    @ApiResponse({ status: 404, description: 'No se encontró la tarea.' })
    async modificarTarea(@Param("id", ParseIntPipe) id: number, @Body() updateTareaDto: UpdateTareaDTO) {
        const existe = await this._tareasService.update(id, { ...updateTareaDto });
        if (existe.length == 0) throw new NotFoundException(`No se encontró la tarea con id: ${id}`);
        return Utils.Response("¡Operación exitosa!", "¡Se modificó la tarea!");
    }

    /**
     * Eliminar una tarea por su ID
     */
    @Delete("eliminar/:id")
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Eliminar tarea', description: 'Elimina una tarea por su ID.' })
    @ApiResponse({ status: 200, description: 'Tarea eliminada correctamente.' })
    @ApiResponse({ status: 404, description: 'No se encontró la tarea.' })
    async eliminarTarea(@Param("id", ParseIntPipe) id: number) {
        const existe = await this._tareasService.deleteWhere({ where: { id } });
        if (existe.length == 0) throw new NotFoundException(`No se encontró la tarea con id: ${id}`);
        return Utils.Response("¡Operación exitosa!", "¡Se eliminó la tarea!");
    }

    /**
     * Cambiar el estado de completado de una tarea
     */
    @Put("cambiar-estado-completado/:id")
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Cambiar estado de completado', description: 'Cambia el estado completado de una tarea.' })
    @ApiResponse({ status: 200, description: 'Estado de tarea modificado correctamente.' })
    async cambiarCompletado(@Param("id", ParseIntPipe) id: number) {
        const tarea = await this._tareasService.findOne({ where: { id } });
        const nuevoEstado = !tarea.completado;
        await this._tareasService.update(id, { completado: nuevoEstado, fecha_terminado: nuevoEstado ? new Date() : null });
        const estado = nuevoEstado ? "COMPLETADO" : "NO COMPLETADO";
        return Utils.Response("¡Operación Exitosa!", `Se cambió la tarea al estado ${estado}`);
    }

    /**
     * Listado paginado de las tareas del usuario con filtros opcionales
     */
    @HttpCode(200)
    @Post("mi-listado")
    @ApiBearerAuth()
    @Throttle({ default: { limit: 100, ttl: 60000 } })
    @ApiOperation({ summary: 'Listado de tareas', description: 'Obtiene tareas filtradas, paginadas y con información de expiración y estado de completado.' })
    @ApiQuery({ name: 'pagina', required: false, type: Number, description: 'Número de página (default 1)' })
    @ApiQuery({ name: 'limite', required: false, type: Number, description: 'Cantidad de tareas por página (default 10)' })
    @ApiQuery({ name: 'busqueda', required: false, type: String, description: 'Término de búsqueda por nombre o contenido' })
    @ApiQuery({ name: 'prioridad', required: false, enum: ['L', 'N', 'A'], description: 'Prioridad: L=Leve, N=Normal, A=Alta' })
    @ApiQuery({ name: 'estatus', required: false, enum: ['T', 'C', 'N'], description: 'Estado de la tarea: T=Todos, C=Completadas, N=No completadas' })
    @ApiQuery({ name: 'fechaInicio', required: false, type: Date, description: 'Filtrar tareas creadas después de esta fecha' })
    @ApiQuery({ name: 'fechaFin', required: false, type: Date, description: 'Filtrar tareas creadas antes de esta fecha' })
    async obtenerTareas(
        @Req() req: any,
        @Query('pagina') pagina?: number,
        @Query('limite') limite?: number,
        @Query('busqueda') busqueda?: string,
        @Query('prioridad') prioridad?: string,
        @Query('fechaInicio') fechaInicio?: Date,
        @Query('fechaFin') fechaFin?: Date,
        @Query('estatus') estatus?: string
    ) {
        const filtros: Filter[] = [{ field: "id_usuario", operator: "eq", value: req.user.id }];

        if (prioridad && prioridad !== "T") {
            const prioridadMap: Record<string, string> = { L: "LEVE", N: "NORMAL", A: "ALTA" };
            filtros.push({ field: "prioridad", operator: "eq", value: prioridadMap[prioridad] });
        }

        if (estatus && estatus !== "T") {
            filtros.push({ field: "completado", operator: "eq", value: estatus === "C" });
        }

        if (fechaInicio) filtros.push({ field: "created", operator: "gt", value: fechaInicio });
        if (fechaFin) filtros.push({ field: "created", operator: "lt", value: fechaFin });

        const data = await this._tareasService.paginate(
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

        return Utils.Response('Operación Exitosa', enhancedData, busqueda, data.total);
    }

    /**
     * Obtener estadísticas generales de las tareas del usuario
     */
    @Get("estadisticas")
    @ApiBearerAuth()
    @Throttle({ default: { limit: 50, ttl: 60000 } })
    @ApiOperation({ summary: 'Estadísticas de tareas', description: 'Obtiene estadísticas agregadas de las tareas del usuario.' })
    @ApiResponse({ status: 200, description: 'Estadísticas obtenidas correctamente.' })
    async obtenerEstadisticas(@Req() req) {
        const id_usuario = req.user.id;
        const resultado = await this._tareasService.obtenerEstadisticas(id_usuario);
        return Utils.Response("Operación Exitosa", resultado[0]);
    }
}
