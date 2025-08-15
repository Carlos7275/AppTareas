import { ApiProperty, OmitType } from '@nestjs/swagger';
import { CreateUserDTO } from './CreateUserDTO';
import { IsOptional } from 'class-validator-i18n';

export class UpdateUserDTO extends OmitType(CreateUserDTO, [
  'password',
] as const) {
    @ApiProperty()
    @IsOptional()
    last_login?: Date;
}
