import { Tareas } from "src/entities/tareas.entity";
import { GenericService } from "./generic.service";
import { Injectable } from "@nestjs/common";
import { Between, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";


@Injectable()
export class TareasService extends GenericService<Tareas> {
    constructor(@InjectRepository(Tareas) private tareasRepository: Repository<Tareas>) {
        super(tareasRepository);
    }

    obtenerEstadisticas(id_usuario: number) {
        return this.tareasRepository.query(
            `SELECT
                COUNT(*) AS total_tareas,
                SUM(CASE WHEN t.completado = 1 THEN 1 ELSE 0 END) AS tareas_completadas,
                SUM(CASE WHEN t.completado = 0 THEN 1 ELSE 0 END) AS tareas_pendientes,
                ROUND(SUM(CASE WHEN t.completado = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) AS porcentaje_completado,
                SUM(CASE WHEN t.prioridad = 'LEVE' THEN 1 ELSE 0 END) AS leve,
                SUM(CASE WHEN t.prioridad = 'NORMAL' THEN 1 ELSE 0 END) AS normal,
                SUM(CASE WHEN t.prioridad = 'MEDIANA' THEN 1 ELSE 0 END) AS mediana,
                SUM(CASE WHEN t.prioridad = 'ALTA' THEN 1 ELSE 0 END) AS alta,
                SUM(CASE WHEN t.completado = 0 AND t.fecha_fin < NOW() THEN 1 ELSE 0 END) AS proximas_a_expirar 
            FROM tareas t
            WHERE t.id_usuario = ?;`,
            [id_usuario]
        );
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