import { GenericService } from './generic.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TipoReporte } from 'src/entities/tipo.reporte.entity';

export class TipoReporteService extends GenericService<TipoReporte> {
    constructor(
        @InjectRepository(TipoReporte)
        private readonly tipoReporteRepository: Repository<TipoReporte>,
    ) {
        super(tipoReporteRepository);
    }


}
