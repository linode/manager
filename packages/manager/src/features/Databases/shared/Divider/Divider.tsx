import React from 'react';

import { cssPropertyVariablesFromMapping } from '../utilities/styleVarsFromMapping';
import styles from './divider.module.css';

import type { Spacing } from '@akamai/cds-tokens';

export type DividerSpacing = (typeof Spacing)[keyof typeof Spacing];

const DIVIDER_MARGIN_CSS_PROPERTY_VARIABLES = {
  marginBottom: '--divider-margin-bottom',
  marginTop: '--divider-margin-top',
} as const;

export interface DividerProps {
  marginBottom?: DividerSpacing;
  marginTop?: DividerSpacing;
}

export const Divider = ({ marginBottom, marginTop }: DividerProps) => {
  const style = cssPropertyVariablesFromMapping(
    { marginBottom, marginTop },
    DIVIDER_MARGIN_CSS_PROPERTY_VARIABLES
  );

  return <hr className={styles.divider} style={style} />;
};
