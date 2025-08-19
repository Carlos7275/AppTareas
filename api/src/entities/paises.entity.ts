import { Column, Entity } from 'typeorm';
import { GenericEntity } from './generic.entity';

@Entity('paises')
export class Paises extends GenericEntity {
  @Column()
  nombre: string;
  @Column()
  nombrecorto: string;
  @Column()
  codigopais: string;
  @Column({ nullable: true })
  codigotelefono: string;
  @Column()
  foto: string;
  @Column({ default: true})
  estatus: boolean
}
