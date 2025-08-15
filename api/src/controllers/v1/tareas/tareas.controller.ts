import { Body, Controller, Delete, HttpCode, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiProperty, ApiTags } from '@nestjs/swagger';
import CreateTareasDTO from 'src/models/Tareas/CreateTareasDto';
import EstadoCompletado from 'src/models/Tareas/EstadoCompletadoDTO';
import { UpdateTareaDTO } from 'src/models/Tareas/UpdateTareaDTO';
import { TareasService } from 'src/services/tareas.service';
import { Utils } from 'src/utils/utils';

@ApiTags("tareas")
@Controller('v1/tareas')
export class TareasController {
    constructor(private _tareasService: TareasService) { }

    @Post("crear")
    @ApiBearerAuth()
    @HttpCode(201)
    @ApiBody({ type: CreateTareasDTO, required: true })
    async crearTarea(@Body() createTareaDTO: CreateTareasDTO) {
        const tareaCreada = await this._tareasService.create({ ...createTareaDTO })

        return Utils.Response("¡Operación exitosa!", tareaCreada);
    }

    @Put("modificar/:id")
    @ApiBearerAuth()
    async modificarTarea(@Param("id", ParseIntPipe) id: number, @Body() updateTareaDto: UpdateTareaDTO) {
        await this._tareasService.update(id, { ...updateTareaDto });

        return Utils.Response("¡Operación exitosa!", "¡Se modifico la tarea!")
    }

    @Delete("eliminar/:id")
    @ApiBearerAuth()
    async eliminarTarea(@Param("id", ParseIntPipe) id: number) {
        await this._tareasService.deleteWhere({ where: { id: id } })
        return Utils.Response("¡Operación exitosa!", "¡Se elimino la tarea!")
    }

    @Put("cambiar-estado-completado/:id")
    @ApiBearerAuth()
    async cambiarCompletado(@Param("id") id: number, @Body() estadoCompletado: EstadoCompletado) {
        await this._tareasService.update(id, { completado: estadoCompletado.completado })
        const estado = estadoCompletado.completado == true ? " COMPLETADO" : "NO COMPLETADO";
        return Utils.Response("¡Operacion Exitosa!", `Se cambio la tarea al estado ${estado}`)
    }

}
