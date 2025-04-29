import { screen } from '@testing-library/react';
import * as React from 'react';
import { describe, expect, it } from 'vitest';

import { breakpoints } from '../../foundations/breakpoints';
import { mockMatchMedia, renderWithTheme } from '../../utilities/testHelpers';
import { Hidden } from './Hidden';

const breakpointNames = Object.keys(breakpoints.values) as Array<
  keyof typeof breakpoints.values
>;
const directions = ['up', 'down'] as const;

describe('Hidden (custom breakpoints)', () => {
  breakpointNames.forEach((breakpoint) => {
    directions.forEach((direction) => {
      const prop =
        `${breakpoint}${direction.charAt(0).toUpperCase() + direction.slice(1)}` as keyof React.ComponentProps<
          typeof Hidden
        >;
      const value = breakpoints.values[breakpoint];
      const query =
        direction === 'up'
          ? `(min-width:${value}px)`
          : `(max-width:${value - 0.05}px)`;

      it(`should hide content when ${prop} matches`, () => {
        mockMatchMedia((q) => q === query);
        renderWithTheme(<Hidden {...{ [prop]: true }}>Test</Hidden>);
        expect(screen.queryByText('Test')).not.toBeInTheDocument();
      });

      it(`should show content when ${prop} does not match`, () => {
        mockMatchMedia(() => false); // never matches
        renderWithTheme(<Hidden {...{ [prop]: true }}>Test</Hidden>);
        expect(screen.getByText('Test')).toBeInTheDocument();
      });
    });
  });
});
