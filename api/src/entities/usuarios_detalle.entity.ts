import { Entity, Column, JoinColumn, OneToOne, ManyToOne } from 'typeorm';
import { Usuarios } from './usuarios.entity';
import { Generos } from './generos.entity';
import { Paises } from './paises.entity';
import { GenericEntity } from './generic.entity';

@Entity('usuarios_detalle')
export class UsuariosDetalle extends GenericEntity {
  @Column()
  nombres: string;
  @Column()
  apellidos: string;
  @Column({ nullable: true, default: '/public/images/users/default.png' })
  foto: string;
  @Column()
  id_pais: number;
  @Column()
  telefono: string;
  @Column({ type: 'date' })
  fecha_nacimiento: Date;
  @Column()
  id_genero: number;
  @ManyToOne(() => Paises, (pais) => pais.id)
  @JoinColumn({ name: 'id_pais' })
  pais: Paises;
  @ManyToOne(() => Generos, (genero) => genero.id)
  @JoinColumn({ name: 'id_genero' })
  genero: Generos;
  @OneToOne(() => Usuarios)
  @JoinColumn({ name: 'id' })
  usuario: Usuarios;
}
