import * as React from 'react';

import { useActiveBreakpointIndex } from '../../hooks/useBreakpoint';
import styles from './Box.module.css';
import { resolveResponsiveValue, spacingToCSS } from './utils';

import type { BreakpointKey, FlexDirection, FlexWrap } from './utils';

type ResponsiveValue<T> = Partial<Record<BreakpointKey, T>> | T | T[];

export interface BoxProps {
  /** The content of the component. */
  children?: React.ReactNode;
  /** Additional class name(s) applied to the root element. */
  className?: string;
  /** The component used for the root node. Either a string to use an HTML element or a component. */
  component?: React.ElementType;
  /**
   * Defines the `flex-direction` style property.
   * Supports a single value, a breakpoint-indexed array `[xs, sm, md, lg, xl]`,
   * or an object keyed by breakpoint name `{ xs: 'column', sm: 'row' }`.
   * @default 'column'
   */
  direction?: ResponsiveValue<FlexDirection>;
  /**
   * Defines the space between immediate children.
   * A plain number is multiplied by 8 px (e.g. `spacing={2}` → `16px`).
   * Supports the same responsive forms as `direction`.
   * Uses `column-gap` for row directions and `row-gap` for column directions.
   * @default 0
   */
  spacing?: ResponsiveValue<number | string>;
  /** Additional CSS styles applied to the root element. */
  style?: React.CSSProperties;
  /**
   * Defines the `flex-wrap` style property. Set to `'wrap'` to allow children
   * to move to a new line when there is not enough space.
   * Supports the same responsive forms as `direction`.
   * @default 'wrap'
   */
  wrap?: ResponsiveValue<FlexWrap>;
}

export const Box = ({
  children,
  className,
  component = 'div',
  direction = 'column',
  spacing = 0,
  style,
  wrap = 'wrap',
}: BoxProps) => {
  const breakpointIndex = useActiveBreakpointIndex();

  const resolvedDirection = resolveResponsiveValue<FlexDirection>(
    direction,
    breakpointIndex,
    'column'
  );

  const resolvedSpacing = resolveResponsiveValue<number | string>(
    spacing,
    breakpointIndex,
    0
  );

  const resolvedWrap = resolveResponsiveValue<FlexWrap>(
    wrap,
    breakpointIndex,
    'wrap'
  );

  const spacingCSS = spacingToCSS(resolvedSpacing);
  const isColumn =
    resolvedDirection === 'column' || resolvedDirection === 'column-reverse';
  const hasSpacing = resolvedSpacing !== 0;

  // Compose CSS class names
  const resolvedClassName = [styles.box, className].filter(Boolean).join(' ');

  let gapStyle: React.CSSProperties = {};
  if (hasSpacing) {
    const canWrap = resolvedWrap !== 'nowrap';
    if (isColumn || canWrap) {
      // Column direction: only rows need spacing.
      // Row direction + wrapping: both axes need spacing so wrapped rows also get gaps.
      gapStyle = { gap: spacingCSS };
    } else {
      // Row direction, no wrapping: only column gaps between siblings.
      gapStyle = { columnGap: spacingCSS };
    }
  }

  // Build inline style: direction + wrap + directional gap + sx overrides
  const containerStyle: React.CSSProperties = {
    flexDirection: resolvedDirection,
    flexWrap: resolvedWrap,
    ...gapStyle,
    ...style,
  };

  // Dynamic component: must be uppercase for JSX, but the prop is camelCase
  // to satisfy the camelCase parameter naming convention.
  const Root = component as React.ElementType<{
    children?: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
  }>;

  return (
    <Root className={resolvedClassName} style={containerStyle}>
      {children}
    </Root>
  );
};
