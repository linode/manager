/**
 * @file Utilities for component testing.
 */

import type { ThemeName } from '@linode/ui';
import type { AnyRoute } from '@tanstack/react-router';
import type { MountReturn } from 'cypress/react';
import type { Flags } from 'src/featureFlags';
/**
 * Array of themes for which to test components.
 */
export const componentThemes: ThemeName[] = ['light', 'dark'];

/**
 * Default theme to use for non-visual component tests.
 *
 * Sorry dark theme users.
 */
// TODO Look into allowing this to be overridden via `.env`.
export const defaultTheme = 'light';

const capitalize = (uncapitalizedString: string): string => {
  return `${uncapitalizedString[0].toUpperCase()}${uncapitalizedString.slice(
    1
  )}`;
};

/**
 * Describes a Cypress command that can be used to mount a component.
 *
 * @param jsx - React node to mount.
 * @param flags - Optional feature flags to apply.
 */
export type MountCommand = (
  jsx: React.ReactNode,
  flags?: any
) => Cypress.Chainable<MountReturn>;

/**
 * Describes a group of tests for a component.
 *
 * Passes a `mount` command to the given `callback` that can be used to
 * mount any component using the default theme.
 *
 * @param componentName - Name of component being tested.
 * @param callback - Test scope callback.
 */
export const componentTests = (
  componentName: string,
  callback: (mountCommand: MountCommand) => void,
  options: {
    routeTree?: (parentRoute: AnyRoute) => AnyRoute[];
    useTanstackRouter?: boolean;
  } = {}
) => {
  const mountCommand = (jsx: React.ReactNode, flags?: Flags) =>
    cy.mountWithTheme(
      jsx,
      defaultTheme,
      flags,
      options.useTanstackRouter,
      options.routeTree
    );
  describe(`${componentName} component tests`, () => {
    callback(mountCommand);
  });
};

/**
 * Describes a group of visual tests for a component.
 *
 * Tests defined inside the given `callback` will be parameterized against
 * every theme. This makes `visualTests` useful for tests focused on accessibility
 * and visual regression.
 *
 * Passes a `mount` command to the given `callback` that can be used to mount
 * any component with the parameterized theme.
 *
 * @param callback - Test scope callback.
 */
export const visualTests = (
  callback: (mountCommand: MountCommand) => void,
  options: {
    routeTree?: (parentRoute: AnyRoute) => AnyRoute[];
    useTanstackRouter?: boolean;
  } = {}
) => {
  describe('Visual tests', () => {
    componentThemes.forEach((themeName: ThemeName) => {
      const mountCommand = (jsx: React.ReactNode, flags?: any) =>
        cy.mountWithTheme(
          jsx,
          themeName,
          flags,
          options.useTanstackRouter,
          options.routeTree
        );
      describe(`${capitalize(themeName)} theme`, () => {
        callback(mountCommand);
      });
    });
  });
};

/**
 * Creates a spy for the given function and assigns it an alias.
 *
 * @example
 * const spyFn = createSpy(() => {}, 'mySpyFunction');
 * mount(<MyComponent onChange={spyFn} />);
 * // ...Later, after interacting with `<MyComponent />`.
 * cy.get('@mySpyFunction').should('have.been.calledOnce');
 *
 * @param fn - Function for which to create spy.
 * @param alias - Alias to assign for later examination into spy.
 *
 * @returns The given function `fn`.
 */
// TODO Find a better place for this util.
export const createSpy = <T>(fn: () => T, alias: string) => {
  const callback = {
    fn,
  };

  cy.spy(callback, 'fn').as(alias);
  return callback.fn;
};
