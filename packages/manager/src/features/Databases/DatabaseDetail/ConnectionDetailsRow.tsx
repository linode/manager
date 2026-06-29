import * as React from 'react';

import { cssVars } from '../shared/utilities/cssVars';
import styles from './DatabaseDetail.module.css';
import { StyledLabelTypography } from './DatabaseSummary/DatabaseSummaryClusterConfiguration.style';

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
        <StyledLabelTypography>{label}</StyledLabelTypography>
      </div>
      <div className={styles.summaryValueColumn}>{children}</div>
    </div>
  );
};
