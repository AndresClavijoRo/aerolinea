import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { catchError, Observable } from 'rxjs';
import { BusinessError, BusinessLogicException } from '../../errors/business-errors';

@Injectable()
export class BusinessErrorsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error: unknown) => {
        // Verificamos si el error es una instancia de BusinessLogicException
        if (error instanceof BusinessLogicException) {
          // Usamos una variable tipada para evitar problemas de comparación con enum
          const errorType: BusinessError = error.type;

          if (errorType === BusinessError.NOT_FOUND) {
            throw new HttpException(error.message, HttpStatus.NOT_FOUND);
          } else if (errorType === BusinessError.PRECONDITION_FAILED) {
            throw new HttpException(error.message, HttpStatus.PRECONDITION_FAILED);
          } else if (errorType === BusinessError.BAD_REQUEST) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
          }
        }
        throw error;
      }),
    );
  }
}
