import { default as _Stack } from '@mui/material/Stack';
import * as React from 'react';

import type { StackProps } from '@mui/material/Stack';

/**
 * A Stack is a layout component that uses flexbox to
 * vertically or horizontally align elements with optional spacing.
 *
 * > Stack is ideal for one-dimensional layouts, while Grid is preferable when you need both vertical and horizontal arrangement.
 */
export const Stack = (props: StackProps) => {
  return <_Stack {...props} />;
};

export type { StackProps };
