import * as React from 'react';

import styles from './Box.module.css';

export interface BoxProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  component?: React.ElementType;
}

/**
 * A generic layout container. Native replacement for `Box` from
 * `@linode/ui`/MUI: no `sx` prop — use `className` (CSS Modules) or
 * `style` instead.
 */
export const Box = React.forwardRef<HTMLDivElement, BoxProps>(
  ({ children, className, component = 'div', ...rest }, ref) => {
    const Root = component;
    const resolvedClassName = [styles.box, className].filter(Boolean).join(' ');

    return (
      <Root className={resolvedClassName} ref={ref} {...rest}>
        {children}
      </Root>
    );
  }
);
