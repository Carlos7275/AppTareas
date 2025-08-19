import { Entity, Column, OneToMany } from 'typeorm';
import { Reporte } from './reporte.entity';
import { GenericEntity } from './generic.entity';

@Entity('tipo_reportes')
export class TipoReporte extends GenericEntity {

    @Column({ unique: true })
    nombre: string;

    @OneToMany(() => Reporte, (reporte) => reporte.tipo)
    reportes: Reporte[];
}
