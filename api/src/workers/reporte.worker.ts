import { Controller, Logger } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { RabbitMQService } from "src/services/rabbitmq.service";
import { ReportesService } from "src/services/reporte.service";
import { TareasService } from "src/services/tareas.service";
import { Filter } from "src/types/filtros.type";
import * as fs from "fs";
import * as path from "path";
import { v4 as uuidv4 } from 'uuid';
import { EstadoReporte } from "src/entities/reporte.entity";

@Controller()
export class ReportesWorker {
    private readonly logger = new Logger(ReportesWorker.name);

    constructor(
        private readonly rabbitService: RabbitMQService,
        private readonly reportesService: ReportesService,
        private readonly tareasService: TareasService,
    ) { }

    @MessagePattern('report_queue')
    async procesarReporte(@Payload() payload: any) {
        this.logger.log(`Mensaje recibido en worker: ${JSON.stringify(payload)}`);

        const datosReporte = await this.reportesService.findOne({ where: { id: payload.id_reporte }, relations: ["usuario"] });
        const tipoReporte = datosReporte.id_tipo_reporte;

        try {
            switch (tipoReporte) {
                case 1:
                    await this.generarReporteTareas(datosReporte);
                    break;

                default:
                    this.logger.error(`No existe el tipo de reporte: ${tipoReporte}`);
                    break;
            }
        } catch (error) {
            this.logger.error(`Error generando reporte: ${error.message}`);

            await this.reportesService.update(datosReporte.id, {
                estado: 'ERROR',
                error: error.message
            });

            const maxRetries = 3;
            const intentos = datosReporte.intentos ?? 0;

            if (intentos < maxRetries) {
                this.logger.log(`Reintentando reporte ${datosReporte.id}, intento ${intentos + 1}`);
                await this.reportesService.update(datosReporte.id, { intentos: intentos + 1, estado: 'REINTENTANDO' });

                await this.rabbitService.publishMessage('report_queue', { id_reporte: datosReporte.id });
            } else {
                this.logger.error(`Reporte ${datosReporte.id} alcanzó el máximo de reintentos (${maxRetries})`);
            }

        }

        return { status: "OK", recibido: payload };
    }

    private async generarReporteTareas(datosReporte: any) {
        this.logger.log("Generando reporte de tareas...");

        const datos = datosReporte.filtros;
        const descripcion = `Reporte de tareas del usuario: ${datosReporte.usuario.nombres} ${datosReporte.usuario.apellidos}`;
        const filtros: Filter[] = [{ field: "id_usuario", operator: "eq", value: datosReporte.id_usuario }];


        if (datos.priorirad && datos.priorirad !== "T") {
            filtros.push({ field: "prioridad", operator: "eq", value: datos.priorirad });
        }
        if (datos.estatus && datos.estatus !== "T") {
            filtros.push({ field: "completado", operator: "eq", value: datos.estatus === "C" });
        }
        if (datos.fechaInicio) filtros.push({ field: "created", operator: "gt", value: datos.fechaInicio });
        if (datos.fechaFin) filtros.push({ field: "created", operator: "lt", value: datos.fechaFin });


        const data = await this.tareasService.paginate(
            1,
            0,
            ['id', 'nombre', 'created', 'fecha_inicio', 'fecha_fin', 'fecha_terminado', 'prioridad', 'completado'],
            datos.busqueda,
            [],
            [],
            filtros
        );


        const reporteBuffer: Buffer = this.tareasService.obtenerReporte(descripcion, data.data);

        if (!reporteBuffer || !Buffer.isBuffer(reporteBuffer)) {
            throw new Error('El reporte no se generó correctamente');
        }
        const fecha = new Date().toISOString().replace(/[:.]/g, '-');
        const uuid = uuidv4();
        const fileName = `ReporteTareas_${uuid}_${fecha}.xlsx`;

        const reportsDir = path.resolve(process.cwd(), 'public', 'reports');

        if (!fs.existsSync(reportsDir)) {
            fs.mkdirSync(reportsDir, { recursive: true });
        }

        const filePath = path.join(reportsDir, fileName);

        fs.writeFileSync(filePath, reporteBuffer);
        const finalPath = `/public/reports/${fileName}`;
        
        await this.reportesService.update(datosReporte.id, {
            nombreArchivo: finalPath,
            estado: EstadoReporte.COMPLETADO
        });
        this.logger.log(`Reporte generado correctamente: ${filePath}`);
    }
}
