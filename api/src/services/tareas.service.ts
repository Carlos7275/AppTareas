import { Tareas } from "src/entities/tareas.entity";
import { GenericService } from "./generic.service";
import {  Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class TareasService extends GenericService<Tareas> {
    constructor(@InjectRepository(Tareas) private tareasRepository: Repository<Tareas>) {
        super(tareasRepository);
    }
}