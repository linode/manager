/**
 * @file Utilities for component testing.
 */

import type { ThemeName } from 'src/foundations/themes';

/**
 * Array of themes for which to test components.
 */
export const componentThemes: ThemeName[] = ['light', 'dark'];

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
export const describeComponent = (
  componentName: string,
  callback: (themeName: ThemeName) => void
) => {
  componentThemes.forEach((themeName: ThemeName) => {
    describe(`${componentName} component (${themeName} theme)`, () => {
      callback(themeName);
    });
  });
};
