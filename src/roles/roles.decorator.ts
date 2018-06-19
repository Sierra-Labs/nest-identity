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
  target,
  key?,
  descriptor?,
) => {
  if (descriptor) {
    // Store metadata on the roles that should access the method.
    Reflect.defineMetadata('roles', roles, descriptor.value);

    // List the methods that have @Roles(...) declared at the target (class) level.
    // This is needed to handle class inheritance when using @InheritRoles()
    extendArrayMetadata('role:properties', [{key, value: descriptor.value}], target.constructor);

    // Store metadata to use the RolesGuard for the method.
    extendArrayMetadata(GUARDS_METADATA, [RolesGuard], descriptor.value);

    return descriptor;
  }
  Reflect.defineMetadata('roles', roles, target);
  extendArrayMetadata(GUARDS_METADATA, [RolesGuard], target);
  return target;
};
