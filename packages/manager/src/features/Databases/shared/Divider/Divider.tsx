import React from 'react';

import { cssVars } from '../utilities/cssVars';
import styles from './divider.module.css';

import type { Spacing } from '@akamai/cds-tokens';

export type DividerSpacing = (typeof Spacing)[keyof typeof Spacing];

export interface DividerProps {
  marginBottom?: DividerSpacing;
  marginTop?: DividerSpacing;
}

export const Divider = ({ marginBottom, marginTop }: DividerProps) => {
  const style = cssVars({
    '--divider-margin-bottom': marginBottom,
    '--divider-margin-top': marginTop,
  });

  return <hr className={styles.divider} style={style} />;
};
