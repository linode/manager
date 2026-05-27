import { renderHook } from '@testing-library/react';

import { resizeScreenSize } from 'src/utilities/testHelpers';

import { THEME_BREAKPOINT_PX, useBreakpoint } from './useBreakpoint';

describe('useBreakpoint', () => {
  describe("'up'", () => {
    it.each([
      ['sm', THEME_BREAKPOINT_PX.sm - 1, false],
      ['sm', THEME_BREAKPOINT_PX.sm, true],
      ['sm', THEME_BREAKPOINT_PX.sm + 1, true],
      ['md', THEME_BREAKPOINT_PX.md - 1, false],
      ['md', THEME_BREAKPOINT_PX.md, true],
      ['lg', THEME_BREAKPOINT_PX.lg - 1, false],
      ['lg', THEME_BREAKPOINT_PX.lg, true],
      ['xl', THEME_BREAKPOINT_PX.xl - 1, false],
      ['xl', THEME_BREAKPOINT_PX.xl, true],
    ] as const)(
      'breakpoint %s at width %i returns %s',
      (breakpoint, width, expected) => {
        resizeScreenSize(width);
        const { result } = renderHook(() => useBreakpoint('up', breakpoint));

        expect(result.current).toBe(expected);
      }
    );

    it('breakpoint xs matches at any finite width (min-width 0)', () => {
      resizeScreenSize(320);
      const { result } = renderHook(() => useBreakpoint('up', 'xs'));

      expect(result.current).toBe(true);
    });
  });

  describe("'down'", () => {
    it.each([
      ['sm', THEME_BREAKPOINT_PX.sm - 1, true],
      ['sm', THEME_BREAKPOINT_PX.sm, false],
      ['sm', THEME_BREAKPOINT_PX.sm + 1, false],
      ['md', THEME_BREAKPOINT_PX.md - 1, true],
      ['md', THEME_BREAKPOINT_PX.md, false],
      ['lg', THEME_BREAKPOINT_PX.lg - 1, true],
      ['lg', THEME_BREAKPOINT_PX.lg, false],
    ] as const)(
      'breakpoint %s at width %i returns %s',
      (breakpoint, width, expected) => {
        resizeScreenSize(width);
        const { result } = renderHook(() => useBreakpoint('down', breakpoint));

        expect(result.current).toBe(expected);
      }
    );

    it('breakpoint xs uses a non-matching query (no widths below xs)', () => {
      resizeScreenSize(320);
      const { result } = renderHook(() => useBreakpoint('down', 'xs'));

      expect(result.current).toBe(false);
    });
  });
});
