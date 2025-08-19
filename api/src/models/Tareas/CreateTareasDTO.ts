import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsEnum, IsDateString, ValidateIf } from "class-validator";
import { Prioridad } from "src/enums/prioridad.enum";

export default class CreateTareasDTO {
  @ApiProperty()
  @IsNotEmpty({ message: "No deje vacío el nombre de la tarea." })
  nombre: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmpty({ message: "No deje vacío la descripción de la tarea." })
  descripcion?: string;

  @ApiProperty({ enum: Prioridad })
  @IsEnum(Prioridad, { message: "La prioridad seleccionada no es válida." })
  prioridad: Prioridad;

  @ApiPropertyOptional({ type: 'string', format: 'date-time' })
  @IsOptional()
  @IsDateString({}, { message: "Fecha de inicio inválida." })
  fecha_inicio?: string;

  @ApiPropertyOptional({ type: 'string', format: 'date-time' })
  @IsOptional()
  @IsDateString({}, { message: "Fecha de fin inválida." })
  @ValidateIf(o => o.fecha_inicio)
  fecha_fin?: string;

  @ApiPropertyOptional({ type: 'boolean' })
  @IsOptional()
  completado?: boolean;

  @ApiPropertyOptional({ type: 'string', format: 'date-time' })
  @IsOptional()
  @IsDateString({}, { message: "Fecha de terminación inválida." })
  @ValidateIf(o => o.fecha_inicio || o.fecha_fin)
  fecha_terminacion?: string;
}
