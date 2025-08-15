import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';


export default class LoginModel {
  @ApiProperty({ description: 'Correo' })
  @IsEmail({}, { message: 'Por favor ingrese un correo electrónico válido.' })
  correo: string;
  @ApiProperty({ description: 'Contraseña' })
  @IsNotEmpty({message:"¡No deje vácia la contraseña!"})
  password: string;

  @ApiProperty({ description: 'SesionActiva' })
  sesionactiva?: boolean;
}
