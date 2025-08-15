import { ApiProperty } from "@nestjs/swagger";

export default class EstadoCompletado {
    @ApiProperty({ type: 'boolean' })
    completado: boolean
}