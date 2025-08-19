import { OmitType } from "@nestjs/swagger";
import CreateTareasDTO from "./CreateTareasDTO";

export class UpdateTareaDTO extends OmitType(CreateTareasDTO, [] as const) {

}