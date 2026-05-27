import React from 'react';

import { cssPropertyVariablesFromMapping } from '../utilities/styleVarsFromMapping';
import styles from './paper.module.css';

import type { Spacing } from '@akamai/cds-tokens';

export type PaperSpacing = (typeof Spacing)[keyof typeof Spacing];

const PAPER_SPACING_CSS_PROPERTY_VARIABLES = {
  marginBottom: '--paper-margin-bottom',
  marginTop: '--paper-margin-top',
  padding: '--paper-padding',
  paddingTop: '--paper-padding-top',
  paddingBottom: '--paper-padding-bottom',
} as const;

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
  const style = cssPropertyVariablesFromMapping(
    { marginBottom, marginTop, padding, paddingTop, paddingBottom },
    PAPER_SPACING_CSS_PROPERTY_VARIABLES
  );

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
