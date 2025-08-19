import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';
import { Utils } from 'src/utils/utils';

@Catch()
export class ErrorFilter implements ExceptionFilter {
  catch(error: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response: Response = ctx.getResponse();

    let message = 'Error interno del servidor';
    let statusCode = error.status || 500;


    if (error?.code) {
      switch (error.code) {
        case 'ER_DUP_ENTRY':
          message = 'Ya existe un registro con ese valor.';
          statusCode = 400;
          break;
        case 'ER_NO_REFERENCED_ROW_2':
          message = 'No se puede realizar la operación porque el registro relacionado no existe.';
          statusCode = 400;
          break;
        case 'ER_ROW_IS_REFERENCED_2':
          message = 'No se puede eliminar o modificar el registro porque está siendo referenciado.';
          statusCode = 400;
          break;

        default:
          message = error.message || message;
          break;
      }
    }

    else if (error instanceof AggregateError) {
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
