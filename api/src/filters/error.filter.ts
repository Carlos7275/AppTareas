import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';
import { Utils } from 'src/utils/utils';

@Catch()
export class ErrorFilter implements ExceptionFilter {
  catch(error: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response: Response = ctx.getResponse();

    let message = 'Internal Server Error';
    let statusCode = error.status || 500;

    if (error instanceof AggregateError) {
      const errors = error.errors.map((e: any) => e.message || e.toString());
      message = errors.join('\n');
    } else if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    } else if (error && error.message) {
      message = error.message;
    }

    if (!response.headersSent) {
      response.status(statusCode).send(Utils.Response(message));
    }
  }
}
