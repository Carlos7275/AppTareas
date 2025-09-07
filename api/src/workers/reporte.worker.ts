import { Controller, Logger } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { RabbitMQService } from "src/services/rabbitmq.service";
import { ReportesService } from "src/services/reporte.service";
import { TareasService } from "src/services/tareas.service";
import { Filter } from "src/types/filtros.type";
import { EstadoReporte } from "src/entities/reporte.entity";
import { ExcelService } from "src/services/excel.service";

@Controller()
export class ReportesWorker {
    private readonly logger = new Logger(ReportesWorker.name);

    constructor(
        private readonly rabbitService: RabbitMQService,
        private readonly reportesService: ReportesService,
        private readonly tareasService: TareasService,
        private readonly excelService: ExcelService
    ) { }

    @MessagePattern('report_queue')
    async procesarReporte(@Payload() payload: any) {
        this.logger.log(`Mensaje recibido en worker: ${JSON.stringify(payload)}`);

        const datosReporte = await this.reportesService.findOne({ where: { id: payload.id_reporte }, relations: ["usuario"] });
        if (!datosReporte) return;

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

        const datos = datosReporte.filtros ? { ...datosReporte.filtros } : {};
        const descripcion = `Reporte de tareas del usuario: ${datosReporte.usuario.nombres} ${datosReporte.usuario.apellidos}`;

        const filtros: Filter[] = [{ field: "id_usuario", operator: "eq", value: datosReporte.id_usuario }];

        if (datos.prioridad && datos.prioridad !== "T") {
            const prioridadMap: Record<string, string> = { L: "LEVE", N: "NORMAL", A: "ALTA" };
            filtros.push({ field: "prioridad", operator: "eq", value: prioridadMap[datos.prioridad] });
        }
        if (datos.estado && datos.estado !== "T") {
            filtros.push({ field: "completado", operator: "eq", value: datos.estado === "C" });
        }
        if (datos.fechaInicio) filtros.push({ field: "created", operator: "gt", value: datos.fechaInicio });
        if (datos.fechaFin) filtros.push({ field: "created", operator: "lt", value: datos.fechaFin });

        const columnas = ['id', 'nombre', 'created', 'fecha_inicio', 'fecha_fin', 'fecha_terminado', 'prioridad', 'completado'];



        const dataIterator = this.tareasService.paginateGenerator(
            10000,
            columnas,
            datos.busqueda,
            [],
            [],
            filtros
        );


        const objeto = { tareas: dataIterator, descripcion };
        
        const posiciones = {
            descripcion: { row: 2, col: 1 },
            tareas: [
                { row: 5, col: 1 },
                { row: 5, col: 2 },
                { row: 5, col: 3 },
                { row: 5, col: 4 },
                { row: 5, col: 5 },
                { row: 5, col: 6 },
                { row: 5, col: 7 },
                { row: 5, col: 8 },

            ]
        };

        const mapeo = {
            tareas: ["nombre", "descripcion", "created", "fecha_inicio", "fecha_fin", "fecha_terminado", "prioridad", "completado"]
        };


        const ruta: string = await this.excelService.generarReporte("reporte-tareas", objeto, posiciones, ["tareas"], mapeo);


        await this.reportesService.update(datosReporte.id, {
            nombreArchivo: ruta,
            estado: EstadoReporte.COMPLETADO
        });

        this.logger.log(`Reporte generado correctamente: ${ruta}`);
    }

}
