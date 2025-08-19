import { ApiProperty } from '@nestjs/swagger';
import {
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

/**
 * Clase Abstracta para Heredar alas Entidades
 */
export abstract class GenericEntity {
    @ApiProperty({ description: 'Id' })
    @PrimaryGeneratedColumn()
    id: number;
    @ApiProperty({ description: 'Fecha de creacion' })
    @CreateDateColumn()
    created: Date;
    @ApiProperty({ description: 'Fecha de actualizacion' })
    @UpdateDateColumn()
    updated: Date;
}
