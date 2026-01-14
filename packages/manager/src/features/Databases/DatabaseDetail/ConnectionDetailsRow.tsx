import { Grid } from '@mui/material';
import * as React from 'react';

import {
  StyledLabelTypography,
  StyledValueGrid,
} from './DatabaseSummary/DatabaseSummaryClusterConfiguration.style';

interface ConnectionDetailsRowProps {
  children: React.ReactNode;
  isSummaryTab?: boolean;
  label: string;
}

export const ConnectionDetailsRow = (props: ConnectionDetailsRowProps) => {
  const { children, label, isSummaryTab } = props;
  return (
    <>
      <Grid
        size={{
          md: isSummaryTab ? 3 : 4,
          xs: 3,
        }}
      >
        <StyledLabelTypography>{label}</StyledLabelTypography>
      </Grid>
      <StyledValueGrid size={{ md: isSummaryTab ? 9 : 8, xs: 9 }}>
        {children}
      </StyledValueGrid>
    </>
  );
};
