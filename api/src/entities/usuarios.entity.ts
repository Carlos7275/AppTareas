import { Entity, Column, JoinColumn, OneToOne, ManyToOne } from 'typeorm';
import { Roles } from './roles.entity';
import { GenericEntity } from './generic.entity';
import { UsuariosDetalle } from './usuarios_detalle.entity';

@Entity('usuarios')
export class Usuarios extends GenericEntity {
  @Column({ unique: true })
  correo: string;
  @Column()
  password: string;
  @Column({ unique: false })
  id_rol: number;
  @Column()
  estatus: boolean;
  @ManyToOne(() => Roles, (role) => role.id)
  @JoinColumn({ name: 'id_rol' })
  rol: Roles;
  @OneToOne(() => UsuariosDetalle, { createForeignKeyConstraints: false })
  @JoinColumn({ name: "id" })
  detalles: UsuariosDetalle;
  @Column({ nullable: true })
  ultimo_login: Date;
}
