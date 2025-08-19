import { Cron, CronExpression } from "@nestjs/schedule";
import { Injectable, Logger } from "@nestjs/common";
import { TareasService } from "./tareas.service";
import { TokensFCMService } from "./token_fcm.service";
import { FirebaseService } from "./firebase.service";
import { UsuariosService } from "./usuarios.service";

@Injectable()
export class RecordatorioTareasCronService {
    private readonly logger = new Logger(RecordatorioTareasCronService.name);

    constructor(
        private readonly tareasService: TareasService,
        private readonly usuariosService: UsuariosService,
        private readonly tokensFCMService: TokensFCMService,
        private readonly firebaseService: FirebaseService
    ) { }

    @Cron(CronExpression.EVERY_5_MINUTES)
    async notificarUsuariosInactivos() {
        this.logger.log("Ejecutando notificación a usuarios inactivos...");

        const usuarios = await this.usuariosService.find({ where: { estatus: true } });

        for (const usuario of usuarios) {
            const tareas = await this.tareasService.find({ where: { id_usuario: usuario.id } });

            let mensaje: string | null = null;

            if (!tareas || tareas.length === 0) {
                mensaje = "¡Crea tu primera tarea para organizarte mejor!";
            } else {
                const ultimaTarea = tareas.reduce((prev, curr) =>
                    prev.created > curr.created ? prev : curr
                );
                const diasInactivos = Math.floor(
                    (Date.now() - new Date(ultimaTarea.created).getTime()) /
                    (1000 * 60 * 60 * 24)
                );

                if (diasInactivos >= 7) {
                    mensaje = `Hace ${diasInactivos} días que no creas una tarea. ¡Organiza tu día creando nuevas tareas!`;
                }
            }

            if (!mensaje) continue;

            const tokens = await this.tokensFCMService.find({ where: { id_usuario: usuario.id } });

            if (!tokens || tokens.length === 0) {
                this.logger.warn(`Usuario ${usuario.id} no tiene tokens registrados`);
                continue;
            }

            for (const token of tokens) {
                try {
                    await this.firebaseService.sendPushNotification(
                        token.token,
                        "Recordatorio de actividad",
                        mensaje,
                    );
                    this.logger.log(`Notificación enviada a usuario ${usuario.id}`);
                } catch (err: any) {
                    if (
                        err.code === "messaging/registration-token-not-registered" ||
                        err.code === "messaging/invalid-argument"
                    ) {
                        await this.tokensFCMService.deleteWhere({ where: { id: token.id } });
                        this.logger.warn(`Token inválido eliminado: ${token.token}`);
                    } else {
                        this.logger.error(`Error enviando notificación: ${err.message}`);
                    }
                }
            }
        }
    }
}
