import * as React from 'react';

import styles from './Typography.module.css';

export interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
  component?: React.ElementType;
}

/**
 * Renders text content. Native replacement for `Typography` from
 * `@linode/ui`/MUI: no `sx`/`variant` prop — use `className` (CSS Modules)
 * or `style` for color, size, weight, etc.
 */
export const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ children, className, component = 'p', ...rest }, ref) => {
    const Root = component;
    const resolvedClassName = [styles.typography, className]
      .filter(Boolean)
      .join(' ');

    return (
      <Root className={resolvedClassName} ref={ref} {...rest}>
        {children}
      </Root>
    );
  }
);
