import React from 'react';

import { cssVars } from '../cssVars';
import styles from './paper.module.css';

import type { Spacing } from '@akamai/cds-tokens';

export type PaperSpacing = (typeof Spacing)[keyof typeof Spacing];

export interface PaperProps {
  children: React.ReactNode;
  className?: string;
  dataTestId?: string;
  marginBottom?: PaperSpacing;
  marginTop?: PaperSpacing;
  outlined?: boolean;
  padding?: PaperSpacing;
  paddingBottom?: PaperSpacing;
  paddingTop?: PaperSpacing;
  /** Merged after spacing CSS variables; use for one-off overrides (e.g. backgroundColor). */
  style?: React.CSSProperties;
}

export const Paper = ({
  marginBottom,
  marginTop,
  padding,
  paddingTop,
  paddingBottom,
  children,
  className,
  dataTestId,
  style: styleProp,
  outlined = true,
}: PaperProps) => {
  const spacingStyle = cssVars({
    '--paper-margin-bottom': marginBottom,
    '--paper-margin-top': marginTop,
    '--paper-padding': padding,
    '--paper-padding-top': paddingTop,
    '--paper-padding-bottom': paddingBottom,
  });
  const style =
    spacingStyle || styleProp ? { ...spacingStyle, ...styleProp } : undefined;
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
      style={style}
    >
      {children}
    </div>
  );
};
