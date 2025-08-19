import { ApiProperty } from '@nestjs/swagger';
export class ChangePasswordDTO {
  @ApiProperty()
  Contraseña: string;
  
  @ApiProperty()
  NuevaContraseña: string;
  @ApiProperty()
  ContraseñaAux: string;
}
