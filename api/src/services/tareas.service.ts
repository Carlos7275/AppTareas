import { Tareas } from "src/entities/tareas.entity";
import { GenericService } from "./generic.service";
import { Injectable } from "@nestjs/common";
import { Between, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import * as path from 'path';
import * as fs from 'fs';
import * as XlsxTemplate from 'xlsx-template';

@Injectable()
export class TareasService extends GenericService<Tareas> {
    constructor(@InjectRepository(Tareas) private tareasRepository: Repository<Tareas>) {
        super(tareasRepository);
    }

    obtenerEstadisticas(id_usuario: number) {
        return this.tareasRepository.query(
            `SELECT
                    COUNT( * ) AS total_tareas,
                    SUM( t.completado = 1 ) AS tareas_completadas,
                    SUM( t.completado = 0 ) AS tareas_pendientes,
                    ROUND( SUM( t.completado = 1 ) * 100.0 / COUNT( * ), 2 ) AS porcentaje_completado,
                    SUM( CASE WHEN t.prioridad = 'LEVE' THEN 1 ELSE 0 END ) AS leve,
                    SUM( CASE WHEN t.prioridad = 'NORMAL' THEN 1 ELSE 0 END ) AS normal,
                    SUM( CASE WHEN t.prioridad = 'MEDIANA' THEN 1 ELSE 0 END ) AS mediana,
                    SUM( CASE WHEN t.prioridad = 'ALTA' THEN 1 ELSE 0 END ) AS alta,
                    SUM( CASE WHEN t.completado = 0 AND t.fecha_fin < NOW( ) THEN 1 ELSE 0 END ) AS proximas_a_expirar 
                    FROM
                    tareas t 
                    WHERE
                    t.id_usuario = ?;`,
            [id_usuario]
        );
    }


    obtenerReporte(descripcionReporte: string, tareas: any[]) {
        const templatePath = path.join(process.cwd(), 'public', 'templates', 'reporte-tareas.xlsx');
        const templateData = fs.readFileSync(templatePath);
        const workbook = new XlsxTemplate(templateData);
        const tareasFormateadas = tareas.map(t => ({
            nombre: t.nombre || "",
            created: t.created ? new Date(t.created) : null,
            fecha_inicio: t.fecha_inicio ? new Date(t.fecha_inicio) : null,
            fecha_fin: t.fecha_fin ? new Date(t.fecha_fin) : null,
            fecha_terminado: t.fecha_terminado ? new Date(t.fecha_terminado) : null,
            prioridad: t.prioridad || "",
            completado: t.completado ? "Sí" : "No"
        }));

        workbook.substitute(1, { tareas: tareasFormateadas, descripcion: descripcionReporte });

        const buffer = workbook.generate({ type: 'nodebuffer' });
        return buffer;
    }

    async obtenerTareasProximas(horas: number) {
        const ahora = new Date();
        const limite = new Date();
        limite.setHours(limite.getHours() + horas);

        return await this.tareasRepository.find({
            where: {
                fecha_fin: Between(ahora, limite),
                completado: false,
            },
        });
    }


}