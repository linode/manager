import Grid from '@mui/material/Unstable_Grid2';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import BarPercent from 'src/components/BarPercent';
import { CircleProgress } from 'src/components/CircleProgress';
import { Notice } from 'src/components/Notice/Notice';

import {
  StyledGreenTypography,
  StyledGreyTypography,
} from './TransferContent.styles';
import { calculatePercentageWithCeiling } from './utils';

interface ContentProps {
  accountBillableInGB: number;
  accountQuotaInGB: number;
  error: boolean;
  linodeLabel: string;
  linodeUsedInGB: number;
  loading: boolean;
  totalUsedInGB: number;
}

export const TransferContent = (props: ContentProps) => {
  const {
    accountQuotaInGB,
    error,
    linodeLabel,
    linodeUsedInGB,
    loading,
    totalUsedInGB,
    // accountBillableInGB
  } = props;
  const theme = useTheme();

  /**
   * In this component we display three pieces of information:
   *
   * 1. Account-level transfer quota for this month
   * 2. The amount of transfer THIS Linode has used this month
   * 3. The remaining transfer on your account this month
   */

  const linodeUsagePercent = calculatePercentageWithCeiling(
    linodeUsedInGB,
    accountQuotaInGB
  );

  const totalUsagePercent = calculatePercentageWithCeiling(
    totalUsedInGB,
    accountQuotaInGB
  );

  const remainingInGB = Math.max(accountQuotaInGB - totalUsedInGB, 0);

  if (error) {
    return (
      <Notice
        text={
          'Network transfer information for this Linode is currently unavailable.'
        }
        important
        spacingBottom={0}
        variant="error"
      />
    );
  }

  if (loading) {
    return (
      <Grid container justifyContent="center">
        <Grid>
          <CircleProgress mini />
        </Grid>
      </Grid>
    );
  }

  return (
    <div>
      <BarPercent
        max={100}
        rounded
        sx={{ marginBottom: `${theme.spacing(0.5)}px` }}
        value={Math.ceil(linodeUsagePercent)}
        valueBuffer={Math.ceil(totalUsagePercent)}
      />
      <StyledGreenTypography>
        <span>
          {linodeLabel} ({linodeUsedInGB} GB)
        </span>
      </StyledGreenTypography>
      <StyledGreyTypography>
        <span>Remaining ({remainingInGB} GB)</span>
      </StyledGreyTypography>
      {/* @todo: display overages  */}
    </div>
  );
};
