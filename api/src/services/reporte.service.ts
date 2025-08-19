import { GenericService } from './generic.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reporte } from 'src/entities/reporte.entity';

export class ReportesService extends GenericService<Reporte> {
    constructor(
        @InjectRepository(Reporte)
        private readonly ReporteRepository: Repository<Reporte>,
    ) {
        super(ReporteRepository);
    }


}
