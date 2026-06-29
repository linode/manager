import type { THEME_BREAKPOINT_PX } from '../../hooks/useBreakpoint';

export type FlexDirection = 'column' | 'column-reverse' | 'row' | 'row-reverse';

export type FlexWrap = 'nowrap' | 'wrap' | 'wrap-reverse';

export type BreakpointKey = keyof typeof THEME_BREAKPOINT_PX;

const BREAKPOINT_ORDER: readonly BreakpointKey[] = [
  'xs',
  'sm',
  'md',
  'lg',
  'xl',
];

type ResponsiveValue<T> = Partial<Record<BreakpointKey, T>> | T | T[];

// Responsive-value resolution helpers
export const resolveResponsiveValue = <T>(
  value: ResponsiveValue<T> | undefined,
  breakpointIndex: number,
  defaultValue: T
): T => {
  if (value === undefined) {
    return defaultValue;
  }

  // Primitive value (string, number, boolean …)
  if (!Array.isArray(value) && (typeof value !== 'object' || value === null)) {
    return value as T;
  }

  // Array: each index maps to the corresponding breakpoint (xs=0, sm=1, …)
  if (Array.isArray(value)) {
    let resolved: T = defaultValue;
    const limit = Math.min(breakpointIndex, value.length - 1);
    for (let i = 0; i <= limit; i++) {
      if (value[i] !== undefined) {
        resolved = value[i];
      }
    }
    return resolved;
  }

  // Object: { xs: ..., sm: ..., … } — cascade from xs up to the active breakpoint
  const obj = value as Partial<Record<BreakpointKey, T>>;
  let resolved: T = defaultValue;
  for (let i = 0; i <= breakpointIndex; i++) {
    const key = BREAKPOINT_ORDER[i];
    if (key in obj && obj[key] !== undefined) {
      resolved = obj[key]!;
    }
  }
  return resolved;
};

/** Convert a spacing value to a CSS string. Numbers are multiplied by 8 px. */
export const spacingToCSS = (spacing: number | string): string => {
  if (typeof spacing === 'number') {
    return spacing === 0 ? '0px' : `${spacing * 8}px`;
  }
  return spacing;
};
