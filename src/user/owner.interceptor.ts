import { Injectable, NestInterceptor, ExecutionContext, UnprocessableEntityException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Used in conjuction with POST and PUT REST API calls to replace properties with the user owner's id.
 * The injector is dependend on the `nest-identity` authentication strategy.
 */
@Injectable()
export class OwnerInterceptor implements NestInterceptor {
  constructor(
    private readonly properties: string[],
    private readonly isUserObject = false
  ) { }

  intercept(context: ExecutionContext, stream$: Observable<any>): Observable<any> {
    const request = context.switchToHttp().getRequest();

    if (!request.user || !request.user.id) {
      throw new UnprocessableEntityException('No authenticated user specified.');
    }

    this.properties.forEach(property => {
      request.body[property] = (this.isUserObject) ? request.user : request.user.id;
    });

    return stream$.pipe(map((data) => data));
  }
}
