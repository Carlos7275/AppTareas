import { OmitType } from "@nestjs/swagger";
import CreateTareasDTO from "./CreateTareasDto";

export class UpdateTareaDTO extends OmitType(CreateTareasDTO, [] as const) {

}