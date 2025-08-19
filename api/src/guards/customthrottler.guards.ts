import {
    ThrottlerGuard as BaseThrottlerGuard,
    ThrottlerException,
    ThrottlerRequest,
} from '@nestjs/throttler';
import { Response } from 'express';
import { Injectable } from '@nestjs/common';
import { Utils } from 'src/utils/utils';

@Injectable()
export class CustomThrottlerGuard extends BaseThrottlerGuard {
    async handleRequest(requestProps: ThrottlerRequest): Promise<boolean> {
        try {
            return await super.handleRequest(requestProps);
        } catch (error) {
            if (error instanceof ThrottlerException) {
                const response = requestProps.context.switchToHttp().getResponse<Response>();


                response.status(429).json(
                    Utils.Response("Demasiadas solicitudes desde esta IP, por favor intente despues"))
            }
            throw error;
        }
    }
}