import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsDate,
    IsEmail,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    Length,
    Matches,
} from 'class-validator-i18n';

export class CreateUserDTO {
    @ApiProperty()
    @IsEmail()
    correo: string;
    @ApiProperty()
    @IsNotEmpty()
    @Length(6, 12)
    password: string;
    @ApiProperty()
    @IsNotEmpty()
    @Length(6, 12)
    username: string;
    @ApiProperty()
    id_rol: number;
    @ApiProperty()
    @IsNotEmpty()
    nombres: string;
    @ApiProperty()
    @IsNotEmpty()
    apellidos: string;
    foto?: string;
    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    id_pais: number;
    @ApiProperty()
    @IsOptional()
    @Matches(/(^$|[0-9]{10}$)/, { message: "Debe ser un número de 10 dígitos o estar vacío" })
    telefono: string;
    @ApiProperty()
    @IsNotEmpty()
    @Matches(/^\d{4}-\d{2}-\d{2}$/, {
        message: 'La fecha debe tener el formato YYYY-MM-DD',
    })
    @Type(() => String)
    fecha_nacimiento: String;
    @ApiProperty()
    @IsNumber()
    id_genero: number;



}
