import { getLinodeTransfer } from '@linode/api-v4/lib/linodes';
import Grid from '@mui/material/Unstable_Grid2';
import { Theme } from '@mui/material/styles';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import BarPercent from 'src/components/BarPercent';
import { CircleProgress } from 'src/components/CircleProgress';
import { Notice } from 'src/components/Notice/Notice';
import { Typography } from 'src/components/Typography';
import { useAPIRequest } from 'src/hooks/useAPIRequest';
import { useAccountTransfer } from 'src/queries/accountTransfer';
import { readableBytes } from 'src/utilities/unitConversions';

const useStyles = makeStyles()((theme: Theme) => ({
  darkGreen: {
    '&:before': {
      backgroundColor: '#5ad865',
    },
  },
  grey: {
    '&:before': {
      backgroundColor: theme.color.grey2,
    },
  },
  header: {
    paddingBottom: 10,
  },
  legendItem: {
    '&:before': {
      borderRadius: 5,
      content: '""',
      height: 20,
      marginRight: 10,

      width: 20,
    },
    alignItems: 'center',
    display: 'flex',
    marginTop: 10,
  },
  poolUsageProgress: {
    marginBottom: theme.spacing(0.5),
  },
}));

interface Props {
  linodeID: number;
  linodeLabel: string;
}

export const NetworkTransfer: React.FC<Props> = (props) => {
  const { linodeID, linodeLabel } = props;
  const { classes } = useStyles();

  const linodeTransfer = useAPIRequest(
    () => getLinodeTransfer(linodeID),
    { billable: 0, quota: 0, used: 0 },
    [linodeID]
  );

  const {
    data: accountTransfer,
    error: accountTransferError,
    isLoading: accountTransferLoading,
  } = useAccountTransfer();

  const linodeUsedInGB = readableBytes(linodeTransfer.data.used, {
    unit: 'GB',
  }).value;
  const totalUsedInGB = accountTransfer?.used || 0;
  const accountQuotaInGB = accountTransfer?.quota || 0;

  const error = Boolean(linodeTransfer.error || accountTransferError);
  const loading = linodeTransfer.loading || accountTransferLoading;

  return (
    <div>
      <Typography className={classes.header}>
        <strong>Monthly Network Transfer</strong>{' '}
      </Typography>
      <TransferContent
        accountBillableInGB={accountTransfer?.billable || 0}
        accountQuotaInGB={accountQuotaInGB}
        error={error}
        linodeLabel={linodeLabel}
        linodeUsedInGB={linodeUsedInGB}
        loading={loading}
        totalUsedInGB={totalUsedInGB}
      />
    </div>
  );
};

// =============================================================================
// TransferContent (With loading and error states)
// =============================================================================
interface ContentProps {
  accountBillableInGB: number;
  accountQuotaInGB: number;
  error: boolean;
  linodeLabel: string;
  linodeUsedInGB: number;
  loading: boolean;
  totalUsedInGB: number;
}

const TransferContent: React.FC<ContentProps> = (props) => {
  const {
    accountQuotaInGB,
    error,
    linodeLabel,
    linodeUsedInGB,
    loading,
    totalUsedInGB,
    // accountBillableInGB
  } = props;
  const { classes } = useStyles();

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
        error={true}
        important
        spacingBottom={0}
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
        className={classes.poolUsageProgress}
        max={100}
        rounded
        value={Math.ceil(linodeUsagePercent)}
        valueBuffer={Math.ceil(totalUsagePercent)}
      />
      <Typography className={`${classes.legendItem} ${classes.darkGreen}`}>
        {linodeLabel} ({linodeUsedInGB} GB)
      </Typography>
      <Typography className={`${classes.legendItem} ${classes.grey}`}>
        Remaining ({remainingInGB} GB)
      </Typography>
      {/* @todo: display overages  */}
    </div>
  );
};

export default React.memo(NetworkTransfer);

// =============================================================================
// Utilities
// =============================================================================

// Get the percentage of a value in relation to a given target. Caps return value at 100%.
export const calculatePercentageWithCeiling = (
  value: number,
  target: number
) => {
  return target > value ? 100 - ((target - value) * 100) / target : 100;
};
