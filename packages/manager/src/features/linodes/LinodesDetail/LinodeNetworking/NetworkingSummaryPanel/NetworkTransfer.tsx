import { getLinodeTransfer } from '@linode/api-v4/lib/linodes';
import * as React from 'react';
import BarPercent from 'src/components/BarPercent';
import CircleProgress from 'src/components/CircleProgress';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import { useAPIRequest } from 'src/hooks/useAPIRequest';
import { readableBytes } from 'src/utilities/unitConversions';
import { useAccountTransfer } from 'src/queries/accountTransfer';

const useStyles = makeStyles((theme: Theme) => ({
  header: {
    paddingBottom: 10,
  },
  poolUsageProgress: {
    marginBottom: theme.spacing(1) / 2,
  },
  overLimit: {
    color: theme.palette.status.warningDark,
    fontFamily: theme.font.bold,
  },
  legendItem: {
    marginTop: 10,
    display: 'flex',
    alignItems: 'center',
    '&:before': {
      content: '""',
      borderRadius: 5,
      width: 20,
      height: 20,

      marginRight: 10,
    },
  },
  darkGreen: {
    '&:before': {
      backgroundColor: '#5ad865',
    },
  },
  lightGreen: {
    '&:before': {
      backgroundColor: '#99ec79',
    },
  },
  grey: {
    '&:before': {
      backgroundColor: theme.color.grey2,
    },
  },
}));

interface Props {
  linodeID: number;
  linodeLabel: string;
}

export const NetworkTransfer: React.FC<Props> = (props) => {
  const { linodeID, linodeLabel } = props;
  const classes = useStyles();

  const linodeTransfer = useAPIRequest(
    () => getLinodeTransfer(linodeID),
    { used: 0, quota: 0, billable: 0 },
    [linodeID]
  );

  const {
    data: accountTransfer,
    isLoading: accountTransferLoading,
    error: accountTransferError,
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
        {accountQuotaInGB > 0 && <>({accountQuotaInGB} GB limit)</>}
      </Typography>
      <TransferContent
        linodeUsedInGB={linodeUsedInGB}
        totalUsedInGB={totalUsedInGB}
        accountQuotaInGB={accountQuotaInGB}
        accountBillableInGB={accountTransfer?.billable || 0}
        linodeLabel={linodeLabel}
        error={error}
        loading={loading}
      />
    </div>
  );
};

// =============================================================================
// TransferContent (With loading and error states)
// =============================================================================
interface ContentProps {
  linodeLabel: string;
  linodeUsedInGB: number;
  totalUsedInGB: number;
  accountQuotaInGB: number;
  accountBillableInGB: number;
  loading: boolean;
  error: boolean;
}

const TransferContent: React.FC<ContentProps> = (props) => {
  const {
    error,
    linodeLabel,
    loading,
    linodeUsedInGB,
    totalUsedInGB,
    accountQuotaInGB,
    // accountBillableInGB
  } = props;
  const classes = useStyles();

  /**
   * In this component we display four pieces of information:
   *
   * 1. Account-level transfer quota for this month
   * 2. The amount of transfer THIS Linode has used this month
   * 3. The amount of transfer OTHER things on your account have used this month
   * 4. The remaining transfer on your account this month
   *
   * The value for #3 comes from subtracting the transfer THIS Linode has used from the TOTAL
   * transfer used on the account.
   */

  const linodeUsagePercent = calculatePercentageWithCeiling(
    linodeUsedInGB,
    accountQuotaInGB
  );

  const totalUsagePercent = calculatePercentageWithCeiling(
    totalUsedInGB,
    accountQuotaInGB
  );

  const otherEntitiesUsedInGB = Math.max(totalUsedInGB - linodeUsedInGB, 0);
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
      <Grid container justify="center">
        <Grid item>
          <CircleProgress mini />
        </Grid>
      </Grid>
    );
  }

  return (
    <div>
      <BarPercent
        max={100}
        value={Math.ceil(linodeUsagePercent)}
        valueBuffer={Math.ceil(totalUsagePercent)}
        className={classes.poolUsageProgress}
        rounded
      />
      <Typography className={`${classes.legendItem} ${classes.darkGreen}`}>
        {linodeLabel} ({linodeUsedInGB} GB)
      </Typography>
      {otherEntitiesUsedInGB > 0 && (
        <Typography className={`${classes.legendItem} ${classes.lightGreen}`}>
          Other entities ({otherEntitiesUsedInGB} GB)
        </Typography>
      )}
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
