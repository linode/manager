/**
 * @file Utilities for component testing.
 */

import { MountReturn } from 'cypress/react18';
import type { ThemeName } from 'src/foundations/themes';

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
 *
 */
export type MountCommand = (
  jsx: React.ReactNode,
  flags?: any
) => Cypress.Chainable<MountReturn>;

/**
 * Describes a group of tests for a component.
 *
 * Additionally parameterizes a test callback for the component against each
 * Cloud Manager theme.
 *
 * @param componentName - Name of component to test.
 * @param callback - Test context callback.
 *
 * @example
 * // Using `describeComponent`...
 * describeComponent('BetaChip', (theme) => {
 *   it('renders text', () => {
 *     cy.mountWithTheme(<BetaChip />, theme);
 *     // Assertions here...
 *   });
 * });
 * // Is equivalent to...
 * describe('BetaChip component (light theme)', () => {
 *   it('renders text', () => {
 *     cy.mountWithTheme(<BetaChip />, 'light');
 *     // Assertions here...
 *   });
 * });
 * describe('BetaChip component (dark theme)', () => {
 *   it('renders text', () => {
 *     cy.mountWithTheme(<BetaChip />, 'dark');
 *     // Assertions here...
 *   })
 * })
 */
// export const describeComponent = (
//   componentName: string,
//   callback: (themeName: ThemeName) => void
// ) => {
//   componentThemes.forEach((themeName: ThemeName) => {
//     describe(`${componentName} component (${themeName} theme)`, () => {
//       callback(themeName);
//     });
//   });
// };

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
  callback: (mountCommand: MountCommand) => void
) => {
  const mountCommand = (jsx: React.ReactNode, flags?: any) =>
    cy.mountWithTheme(jsx, defaultTheme, flags);
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
export const visualTests = (callback: (mountCommand: MountCommand) => void) => {
  describe('Visual tests', () => {
    componentThemes.forEach((themeName: ThemeName) => {
      const mountCommand = (jsx: React.ReactNode, flags?: any) =>
        cy.mountWithTheme(jsx, themeName, flags);
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
