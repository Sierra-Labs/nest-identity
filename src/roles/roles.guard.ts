import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { User } from '../entities/user.entity';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class RolesGuard extends (AuthGuard('jwt') as { new (): any })
  implements CanActivate {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const handler = context.getHandler();
    const request = context.switchToHttp().getRequest();
    const roles = this.reflector.get<string[]>('roles', handler) || [];

    if (roles.length === 0) {
      // if role guard is used, make sure at least one role is specified
      throw new UnprocessableEntityException('No role specified.');
    }

    if (roles.indexOf('$everyone') > -1) {
      return true; // everyone should activate
    }

    // make sure the user is logged in with JWT
    const canActivate = await super.canActivate(context);

    // get user from request object
    const user = request.user || { roles: [] };
    if (!user.roles) user.roles = [];

    // test to see if any of the user's roles are in the acceptable roles
    for (const role of user.roles) {
      if (roles.indexOf(role.name) > -1) {
        return true;
      }
    }

    // test the programmatic roles that start with '$'
    for (const pRole of roles) {
      if (pRole[0] !== '$') {
        continue;
      }

      if (await this.checkRole(pRole, user, request)) {
        return true;
      }
    }
  }

  private async checkRole(
    role: string,
    user: User,
    request: Request,
  ): Promise<boolean> {
    let retval = false;
    switch (role) {
      case '$authenticated':
        retval = !!user;
        break;
      case '$userOwner':
        if (request && request.params) {
          retval =
            parseInt(request.params.id, 10) === user.id ||
            request.params.id === 'me';
        }
        break;
    }

    return retval;
  }
}
