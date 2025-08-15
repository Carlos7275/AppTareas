import { ApiProperty } from '@nestjs/swagger';
import {  IsEmail, IsNotEmpty } from 'class-validator';


export default class LoginModel {
  @ApiProperty({ description: 'Correo', type: String, example: "usuario@pruebas.com" })
  @IsEmail({}, { message: 'Por favor ingrese un correo electrónico válido.' })
  
  correo: string;
  @ApiProperty({ description: 'Contraseña', type: String, example: "password" })
  @IsNotEmpty({ message: "¡No deje vácia la contraseña!" })
  password: string;

  @ApiProperty({ description: 'SesionActiva', type: "boolean", example: "true" })
  sesionactiva?: boolean;
}
