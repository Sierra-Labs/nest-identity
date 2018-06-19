import { RolesGuard } from './roles.guard';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { extendArrayMetadata } from '@nestjs/common/utils/extend-metadata.util';

/**
 * Inherit all the class member decorators from base class that has `@Roles(...)`
 */
export const InheritRoles = () => (
  target,
  key?,
  descriptor?,
) => {
  // Get the base class
  const parentTarget = Object.getPrototypeOf(target.prototype).constructor;

  // Get a list of properties that have @Roles(...) declarared
  const properties = Reflect.getMetadata('role:properties', parentTarget);

  // Apply all Metadata from base class to extended class to get roles data
  for (const property of properties) {
    target.prototype[property.key] = property.value;
    const methodMetadataKeys = Reflect.getMetadataKeys(property.value);
    for (const metaKey of methodMetadataKeys) {
      const metadata = Reflect.getMetadata(metaKey, property.value);
      Reflect.defineMetadata(metaKey, metadata, target.prototype[property.key]);
    }
  }
};
