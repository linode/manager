import React from 'react';

import styles from './Paper.module.css';

export interface PaperProps {
  children: React.ReactNode;
  className?: string;
  dataTestId?: string;
  outlined?: boolean;
  /** Merged onto the root element; use for one-off overrides (e.g. backgroundColor). */
  style?: React.CSSProperties;
}

export const Paper = React.forwardRef<HTMLDivElement, PaperProps>(
  ({ children, className, dataTestId, style, outlined = false }, ref) => {
    const resolvedClassName = [
      styles.paper,
      outlined ? styles.outlined : undefined,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div
        className={resolvedClassName}
        data-testid={dataTestId ?? 'data-qa-paper'}
        ref={ref}
        style={style}
      >
        {children}
      </div>
    );
  }
);
