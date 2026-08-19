import * as React from 'react';

import styles from './Chip.module.css';

export interface ChipProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  clickable?: boolean;
  component?: React.ElementType;
  /** Rendered after the label. */
  deleteIcon?: React.ReactNode;
  disabled?: boolean;
  /** Rendered before the label. */
  icon?: React.ReactNode;
  /** Fired on click or on Enter/Space when focused via keyboard. */
  onDelete?: (event: React.SyntheticEvent<HTMLElement>) => void;
  size?: 'medium' | 'small';
  variant?: 'filled' | 'outlined';
}

/**
 * A compact element that represents an input, attribute, or action.
 * Native replacement for `Chip` from `@linode/ui`/MUI: no `sx` prop —
 * use `className` (CSS Modules) or `style` instead.
 */
export const Chip = React.forwardRef<HTMLDivElement, ChipProps>(
  (
    {
      children,
      className,
      component = 'div',
      icon,
      deleteIcon,
      onDelete,
      clickable = false,
      disabled = false,
      size = 'medium',
      variant = 'filled',
      ...rest
    },
    ref
  ) => {
    const Root = component;
    const chipClasses = [
      styles.chip,
      styles[size],
      styles[variant],
      clickable && !disabled && styles.clickable,
      disabled && styles.disabled,
      deleteIcon && styles.deletable,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <Root className={chipClasses} ref={ref} {...rest}>
        {icon && <span>{icon}</span>}
        {children}
        {deleteIcon && (
          <span
            aria-label="delete"
            className={styles.deleteIcon}
            onClick={onDelete}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onDelete?.(event);
              }
            }}
            role="button"
            tabIndex={0}
          >
            {deleteIcon}
          </span>
        )}
      </Root>
    );
  }
);
