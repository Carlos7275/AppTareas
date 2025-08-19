import { Column, Entity } from "typeorm";
import { GenericEntity } from "./generic.entity";

@Entity('roles')
export class Roles extends GenericEntity {
    @Column()
    descripcion:string;
}