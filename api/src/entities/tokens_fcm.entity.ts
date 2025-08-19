import { Column, Entity } from "typeorm";
import { GenericEntity } from "./generic.entity";

@Entity("tokens_fcm")
export class TokensFCM extends GenericEntity {
    @Column()
    id_usuario: number;
    @Column()
    token: string
}