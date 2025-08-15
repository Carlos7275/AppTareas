import { Body, Controller, Delete, HttpCode, NotFoundException, Param, ParseIntPipe, Post, Put, Query, Req, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { NotFoundError } from 'rxjs';
import CreateTareasDTO from 'src/models/Tareas/CreateTareasDto';
import EstadoCompletado from 'src/models/Tareas/EstadoCompletadoDTO';
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
    async cambiarCompletado(@Param("id") id: number, @Body() estadoCompletado: EstadoCompletado) {
        await this._tareasService.update(id, { completado: estadoCompletado.completado })
        const estado = estadoCompletado.completado == true ? " COMPLETADO" : "NO COMPLETADO";
        return Utils.Response("¡Operacion Exitosa!", `Se cambio la tarea al estado ${estado}`)
    }

    @HttpCode(200)
    @Post("mi-listado")
    @ApiBearerAuth()
    @ApiQuery({ name: 'pagina', required: false, type: Number })
    @ApiQuery({ name: 'limite', required: false, type: Number })
    @ApiQuery({ name: 'busqueda', required: false, type: String })
    async obtenerTareas(
        @Req() req: any,
        @Query('pagina') pagina?: number,
        @Query('limite') limite?: number,
        @Query('busqueda') busqueda?: string,
    ) {

        const filtros: Filter[] = [{ field: "id_usuario", operator: "eq", value: req.user.id }];

        let data = await this._tareasService.paginate(
            pagina,
            limite,
            ['id', 'nombre',],
            busqueda,
            [],
            [],
            filtros


        );
        return Utils.Response('Operacion Exitosa', data.data, busqueda, data.total);
    }

}
