import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

@Injectable()
export class UrlPrefixInterceptor implements NestInterceptor {
    constructor(private readonly fields: string[] = ['foto', 'logo', "nombreArchivo",]) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const host = `${request.protocol}://${request.get('host')}`;

        const processItem = (item: any): any => {
            if (!item || typeof item !== 'object') return item;

            for (const key of Object.keys(item)) {
                const value = item[key];

                // Si es un campo de imagen relativa, le agregamos el host
                if (this.fields.includes(key) && typeof value === 'string' && value.startsWith('/')) {
                    item[key] = `${host}${value}`;
                }

                // Si hay arrays u objetos anidados, procesarlos
                if (Array.isArray(value)) {
                    item[key] = value.map((v) => processItem(v));
                } else if (typeof value === 'object') {
                    item[key] = processItem(value);
                }
            }
            return item;
        };

        return next.handle().pipe(
            map((data) => (Array.isArray(data) ? data.map(processItem) : processItem(data))),
        );
    }
}
