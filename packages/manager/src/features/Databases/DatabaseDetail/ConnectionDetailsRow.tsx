import { Grid } from '@mui/material';
import * as React from 'react';

import {
  StyledLabelTypography,
  StyledValueGrid,
} from './DatabaseSummary/DatabaseSummaryClusterConfiguration.style';

interface ConnectionDetailsRowProps {
  children: React.ReactNode;
  label: string;
}

const ConnectionDetailsRow = (props: ConnectionDetailsRowProps) => {
  const { children, label } = props;
  return (
    <>
      <Grid
        size={{
          md: 4,
          xs: 3,
        }}
      >
        <StyledLabelTypography>{label}</StyledLabelTypography>
      </Grid>
      <StyledValueGrid size={{ md: 8, xs: 9 }}>{children}</StyledValueGrid>
    </>
  );
};

export default ConnectionDetailsRow;
