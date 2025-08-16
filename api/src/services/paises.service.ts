import { GenericService } from './generic.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Paises } from 'src/entities/paises.entity';

export class PaisesService extends GenericService<Paises> {
    constructor(
        @InjectRepository(Paises)
        private readonly paisesRepository: Repository<Paises>,
    ) {
        super(paisesRepository);
    }


}
