import { lazyRouteComponent } from '@tanstack/react-router';

import type { ComponentType } from 'react';

type AnyModule = { [key: string]: any };

/**
 * This function is a wrapper around lazyRouteComponent that ensures the
 * component is a valid React component.
 *
 * lazyRouteComponent does not provide the type safety we need to ensure handle both default and named exports.
 * By using a function overload we do just that.
 */
export function strictLazyRouteComponent<
  T extends { default: ComponentType<any> }
>(importer: () => Promise<T>): ReturnType<typeof lazyRouteComponent>;
export function strictLazyRouteComponent<
  T extends AnyModule,
  K extends keyof T
>(
  importer: () => Promise<T>,
  exportName: K
): ReturnType<typeof lazyRouteComponent>;
export function strictLazyRouteComponent<T extends AnyModule>(
  importer: () => Promise<T>,
  exportName?: string
): ReturnType<typeof lazyRouteComponent> {
  return lazyRouteComponent(() =>
    importer().then((module) => {
      let component: ComponentType<any>;

      if (exportName) {
        if (exportName in module) {
          component = module[exportName] as ComponentType<any>;
        } else {
          throw new Error(`Export "${exportName}" not found in module`);
        }
      } else if ('default' in module) {
        component = module.default;
      } else {
        throw new Error('No default export found in module');
      }

      if (typeof component !== 'function' && typeof component !== 'object') {
        throw new Error(
          `Export "${exportName || 'default'}" is not a valid React component`
        );
      }

      return { default: component };
    })
  );
}
