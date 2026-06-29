import React from 'react';

import { cssVars } from '../utilities/cssVars';
import styles from './paper.module.css';

import type { Spacing } from '@akamai/cds-tokens';

export type PaperSpacing = (typeof Spacing)[keyof typeof Spacing];

export interface PaperProps {
  children: React.ReactNode;
  dataTestId?: string;
  marginBottom?: PaperSpacing;
  marginTop?: PaperSpacing;
  padding?: PaperSpacing;
  paddingBottom?: PaperSpacing;
  paddingTop?: PaperSpacing;
}

export const Paper = ({
  marginBottom,
  marginTop,
  padding,
  paddingTop,
  paddingBottom,
  children,
  dataTestId,
}: PaperProps) => {
  const style = cssVars({
    '--paper-margin-bottom': marginBottom,
    '--paper-margin-top': marginTop,
    '--paper-padding': padding,
    '--paper-padding-top': paddingTop,
    '--paper-padding-bottom': paddingBottom,
  });

  return (
    <div
      className={styles.paper}
      data-testid={dataTestId ?? 'data-qa-paper'}
      style={style}
    >
      {children}
    </div>
  );
};
