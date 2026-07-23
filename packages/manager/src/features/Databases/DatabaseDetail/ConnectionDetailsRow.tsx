import * as React from 'react';

import { cssVars } from '../shared/utilities/cssVars';
import styles from './DatabaseDetail.module.css';

interface ConnectionDetailsRowProps {
  children: React.ReactNode;
  isSummaryTab?: boolean;
  label: string;
}

export const ConnectionDetailsRow = (props: ConnectionDetailsRowProps) => {
  const { children, label, isSummaryTab } = props;

  const style = cssVars({
    '--summary-label-width': isSummaryTab ? '25%' : '30%',
  });

  return (
    <div className={styles.summaryLabelValueContainer} style={style}>
      <div className={styles.summaryLabelColumn}>
        <p>{label}</p>
      </div>
      <div className={styles.summaryValueColumn}>{children}</div>
    </div>
  );
};
