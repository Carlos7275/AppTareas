import { Generos } from 'src/entities/generos.entity';
import { GenericService } from './generic.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

export class GenerosService extends GenericService<Generos> {
    constructor(
        @InjectRepository(Generos)
        private readonly generosRepository: Repository<Generos>,
    ) {
        super(generosRepository);
    }
}
