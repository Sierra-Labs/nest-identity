import { ReflectMetadata, UseGuards } from '@nestjs/common';
import { RolesGuard } from './roles.guard';

import { GUARDS_METADATA } from '@nestjs/common/constants';
import { extendArrayMetadata } from '@nestjs/common/utils/extend-metadata.util';
import { validateEach } from '@nestjs/common/utils/validate-each.util';

/**
 * Implements the ReflectMetadata decorator combined with UseGuards decorator
 * @param roles array of role names
 */
export const Roles = (...roles: string[]) => (
  target: object,
  key?,
  descriptor?,
) => {

  if (descriptor) {
    Reflect.defineMetadata('roles', roles, descriptor.value);
    extendArrayMetadata(GUARDS_METADATA, [RolesGuard], descriptor.value);

    return descriptor;
  }
  Reflect.defineMetadata('roles', roles, target);
  extendArrayMetadata(GUARDS_METADATA, [RolesGuard], target);
  return target;
};
