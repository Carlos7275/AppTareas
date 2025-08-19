import { Module } from '@nestjs/common';
import { TareasController } from './tareas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tareas } from 'src/entities/tareas.entity';
import { TareasService } from 'src/services/tareas.service';

@Module({
    imports: [TypeOrmModule.forFeature([Tareas])],
    providers: [TareasService],
    controllers: [TareasController]
})
export class TareasModule { }
