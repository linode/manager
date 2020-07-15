import { getNetworkUtilization } from '@linode/api-v4/lib/account';
import { getLinodeTransfer } from '@linode/api-v4/lib/linodes';
import * as React from 'react';
import BarPercent from 'src/components/BarPercent/BarPercent_CMR';
import CircleProgress from 'src/components/CircleProgress';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import { useAPIRequest } from 'src/hooks/useAPIRequest';
import { readableBytes } from 'src/utilities/unitConversions';

const useStyles = makeStyles((theme: Theme) => ({
  header: {
    paddingBottom: theme.spacing() / 2
  },
  progressWrapper: {
    width: '290px'
  },
  poolUsageProgress: {
    marginBottom: theme.spacing(1) / 2
  },
  overLimit: {
    color: theme.palette.status.warningDark,
    fontFamily: theme.font.bold
  },
  legendItem: {
    marginTop: 14,
    display: 'flex',
    alignItems: 'center',
    '&:before': {
      content: '""',
      borderRadius: 5,
      width: 20,
      height: 20,

      marginRight: 10
    }
  },
  darkGreen: {
    '&:before': {
      backgroundColor: '#5ad865'
    }
  },
  lightGreen: {
    '&:before': {
      backgroundColor: '#99ec79'
    }
  },
  grey: {
    '&:before': {
      backgroundColor: theme.color.grey2
    }
  }
}));

interface Props {
  linodeID: number;
  linodeLabel: string;
}

export const NetworkTransfer: React.FC<Props> = props => {
  const { linodeID, linodeLabel } = props;
  const classes = useStyles();

  const linodeTransfer = useAPIRequest(
    () => getLinodeTransfer(linodeID),
    { used: 0, quota: 0, billable: 0 },
    [linodeID]
  );

  const accountTransfer = useAPIRequest(
    getNetworkUtilization,
    { used: 0, quota: 0, billable: 0 },
    []
  );

  const linodeUsedInGB = readableBytes(linodeTransfer.data.used, {
    unit: 'GB'
  }).value;
  const totalUsedInGB = accountTransfer.data.used;
  const accountQuotaInGB = accountTransfer.data.quota;

  const error = Boolean(linodeTransfer.error || accountTransfer.error);
  const loading = linodeTransfer.loading || accountTransfer.loading;

  return (
    <div>
      <Typography className={classes.header}>
        <strong>Monthly Network Transfer</strong> ({accountQuotaInGB} GB limit)
      </Typography>
      <TransferContent
        linodeUsedInGB={linodeUsedInGB}
        totalUsedInGB={totalUsedInGB}
        accountQuotaInGB={accountQuotaInGB}
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
  loading: boolean;
  error: boolean;
}

const TransferContent: React.FC<ContentProps> = props => {
  const {
    error,
    linodeLabel,
    loading,
    linodeUsedInGB,
    totalUsedInGB,
    accountQuotaInGB
  } = props;
  const classes = useStyles();

  const linodeUsagePercent =
    accountQuotaInGB > linodeUsedInGB
      ? 100 - ((accountQuotaInGB - linodeUsedInGB) * 100) / accountQuotaInGB
      : 100;

  const otherEntitiesUsedInGB = totalUsedInGB - linodeUsedInGB;

  const otherEntitiesUsagePercent =
    accountQuotaInGB > otherEntitiesUsedInGB
      ? 100 -
        ((accountQuotaInGB - otherEntitiesUsedInGB) * 100) / accountQuotaInGB
      : 100;

  const remainingInGB = accountQuotaInGB - totalUsedInGB;

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
    <div className={classes.progressWrapper}>
      <BarPercent
        max={100}
        value={Math.ceil(linodeUsagePercent)}
        valueBuffer={Math.ceil(otherEntitiesUsagePercent)}
        className={classes.poolUsageProgress}
        rounded
        overLimit={accountQuotaInGB < linodeUsedInGB}
      />
      <Typography className={`${classes.legendItem} ${classes.darkGreen}`}>
        {linodeLabel} ({linodeUsedInGB} GB)
      </Typography>
      <Typography className={`${classes.legendItem} ${classes.lightGreen}`}>
        Other entities ({otherEntitiesUsedInGB} GB)
      </Typography>
      <Typography className={`${classes.legendItem} ${classes.grey}`}>
        Remaining ({remainingInGB} GB)
      </Typography>
      {/* <Grid container justify="space-between">
        <Grid item style={{ marginRight: 10 }}>
          <Typography>
            {readableLinodeUsed.value} {readableLinodeUsed.unit} Used
          </Typography>
        </Grid>
        <Grid item>
          <Typography>
            {quotaInBytes >= linodeUsedInBytes ? (
              <span>{readableFree.formatted} Available</span>
            ) : (
              <span className={classes.overLimit}>
                {readableFree.formatted.toString().replace(/\-/, '')} Over Quota
              </span>
            )}
          </Typography>
        </Grid>
      </Grid> */}
    </div>
  );
};

export default React.memo(NetworkTransfer);
