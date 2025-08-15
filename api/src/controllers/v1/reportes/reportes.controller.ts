import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags("reportes")
@Controller('v1/reportes')
export class ReportesController { }
