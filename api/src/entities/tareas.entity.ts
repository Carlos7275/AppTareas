import { Column, Entity } from "typeorm";
import { GenericEntity } from "./generic.entity";
import { Prioridad } from "src/enums/prioridad.enum";

@Entity("tareas")
export class Tareas extends GenericEntity {
    @Column()
    nombre: string;

    @Column()
    descripcion: string

    @Column({
        type: 'enum',
        enum: Prioridad,
        default: Prioridad.NORMAL,
    })
    prioridad: Prioridad

    @Column()
    id_usuario: number
    @Column({ nullable: true })
    fecha_inicio: Date;

    @Column()
    fecha_fin: Date;

    @Column({ nullable: true })
    fecha_terminado: Date
    @Column()
    completado: boolean;

}