import { Column, Entity, Index } from "typeorm";
import { GenericEntity } from "./generic.entity";
import { Prioridad } from "src/enums/prioridad.enum";

@Entity("tareas")
@Index("idx_tareas_nombre", ["nombre"], { fulltext: true })
@Index("idx_tareas_descripcion", ["descripcion"], { fulltext: true })
@Index("idx_tareas_created", ["created"])
@Index("idx_tareas_fecha_inicio", ["fecha_inicio"])
@Index("idx_tareas_fecha_fin", ["fecha_fin"])
@Index("idx_tareas_fecha_terminado", ["fecha_terminado"])
@Index("idx_tareas_prioridad", ["prioridad"])
@Index("idx_tareas_completado", ["completado"])
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