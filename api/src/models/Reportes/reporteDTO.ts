import { IsNumber, IsOptional, IsObject } from 'class-validator';

export class ReporteDTO {
    @IsNumber()
    id_tipo_reporte: number;

    @IsObject()
    @IsOptional()
    filtros?: Record<string, any>;
}
