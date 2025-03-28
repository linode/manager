import { CircleProgress, Notice } from '@linode/ui';
import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import * as React from 'react';

import { BarPercent } from 'src/components/BarPercent';

import {
  StyledLinodeUsage,
  StyledPoolUsage,
  StyledRemainingPoolUsage,
} from './TransferContent.styles';
import { calculatePercentageWithCeiling } from './utils';

interface ContentProps {
  accountBillableInGB: number;
  accountQuotaInGB: number;
  error: boolean;
  isDynamicPricingDC: boolean;
  linodeLabel: string;
  linodeUsedInGB: number;
  loading: boolean;
  regionName: string;
  totalUsedInGB: number;
}

export const TransferContent = (props: ContentProps) => {
  const {
    accountQuotaInGB,
    error,
    isDynamicPricingDC,
    linodeLabel,
    linodeUsedInGB,
    loading,
    regionName,
    totalUsedInGB,
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
      <Grid
        container
        sx={{
          justifyContent: 'center',
        }}
      >
        <Grid>
          <CircleProgress size="sm" />
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
      <StyledLinodeUsage>
        <span>
          {linodeLabel} ({linodeUsedInGB} GB - {Math.ceil(linodeUsagePercent)}
          %)
        </span>
      </StyledLinodeUsage>
      <StyledPoolUsage>
        <span>
          {isDynamicPricingDC
            ? `${regionName} Transfer Used (${totalUsedInGB} GB - ${Math.ceil(
                totalUsagePercent
              )}%)`
            : `Global Pool Used (${totalUsedInGB} GB - ${Math.ceil(
                totalUsagePercent
              )}%)`}
        </span>
      </StyledPoolUsage>
      <StyledRemainingPoolUsage>
        <span>
          {isDynamicPricingDC
            ? `${regionName} Transfer Remaining (${remainingInGB} GB)`
            : `Global Pool Remaining (${remainingInGB} GB)`}
        </span>
      </StyledRemainingPoolUsage>
    </div>
  );
};
