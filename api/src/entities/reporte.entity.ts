import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { GenericEntity } from './generic.entity';
import { TipoReporte } from './tipo.reporte.entity';
import { UsuariosDetalle } from './usuarios_detalle.entity';

export enum EstadoReporte {
    PENDIENTE = 'PENDIENTE',
    PROCESANDO = 'PROCESANDO',
    COMPLETADO = 'COMPLETADO',
    REINTENTANDO = 'REINTENTANDO',
    ERROR = 'ERROR',
}

@Entity('reportes')
export class Reporte extends GenericEntity {
    @Column()
    id_usuario: number;

    @ManyToOne(() => UsuariosDetalle, (usuario) => usuario.id, { eager: true })
    @JoinColumn({ name: 'id_usuario' })
    usuario: UsuariosDetalle;

    @ManyToOne(() => TipoReporte, (tipo) => tipo.reportes, { eager: true })
    @JoinColumn({ name: 'id_tipo_reporte' })
    tipo: TipoReporte;

    @Column()
    id_tipo_reporte: number;

    @Column('json', { nullable: true })
    filtros: Record<string, any>;

    @Column({
        type: 'enum',
        enum: EstadoReporte,
        default: EstadoReporte.PENDIENTE,
    })
    estado: EstadoReporte;

    @Column({ nullable: true })
    nombreArchivo: string;

    @Column({ nullable: true })
    error?: string;

    @Column({ nullable: true })
    intentos: number
}
