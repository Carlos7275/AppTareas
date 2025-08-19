import { GenericService } from './generic.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TokensFCM } from 'src/entities/tokens_fcm.entity';

export class TokensFCMService extends GenericService<TokensFCM> {
    constructor(
        @InjectRepository(TokensFCM)
        private readonly tokensFCMRepository: Repository<TokensFCM>,
    ) {
        super(tokensFCMRepository);
    }


}
