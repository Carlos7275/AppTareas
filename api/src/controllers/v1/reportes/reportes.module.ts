import { Module } from '@nestjs/common';
import { RabbitMQService } from 'src/services/rabbitmq.service';
import { ReportesController } from './reportes.controller';
import { ReportesService } from 'src/services/reporte.service';
import { TareasService } from 'src/services/tareas.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tareas } from 'src/entities/tareas.entity';
import { Reporte } from 'src/entities/reporte.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Tareas, Reporte]), ],
    providers: [RabbitMQService, ReportesService, TareasService],
    controllers: [ReportesController]
})
export class ReportesModule { }
