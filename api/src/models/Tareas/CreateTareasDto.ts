import { Optional } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";
import { Prioridad } from "src/enums/prioridad.enum";

export default class CreateTareasDTO {
    @ApiProperty()
    @IsNotEmpty({ message: "No deje vácio el nombre de la tarea." })
    nombre: string;

    @ApiProperty()
    @Optional()
    descripcion: string;


    @ApiProperty({ enum: Prioridad })
    @IsNotEmpty({ message: "No deje vácia la prioridad de la tarea." })
    prioridad: Prioridad

    @ApiProperty({ type: 'string' })
    @Optional()
    fecha_inicio: Date;

    @ApiProperty({ type: 'string' })
    @Optional()
    fecha_fin: Date;


    @ApiProperty({ type: 'boolean' })
    @Optional()
    completada: boolean;


}