import { Column, Entity } from 'typeorm';
import { GenericEntity } from './generic.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('generos')
export class Generos extends GenericEntity {
  @Column()
  @ApiProperty({ description: 'Descripcion del Genero' })
  public descripcion: string;
}
