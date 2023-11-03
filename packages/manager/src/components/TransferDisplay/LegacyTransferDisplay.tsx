// ======================================================================================
// This is a copy of the original TransferDisplay component, which is getting deprecated.
// It can be safely deleted once the new TransferDisplay component
// is fully rolled out and the dcSpecificPricing flag is cleaned up.
// ======================================================================================

import Grid from '@mui/material/Unstable_Grid2';
import { Theme } from '@mui/material/styles';
import { DateTime } from 'luxon';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import { BarPercent } from 'src/components/BarPercent';
import { Dialog } from 'src/components/Dialog/Dialog';
import { Link } from 'src/components/Link';
import { Typography } from 'src/components/Typography';
import { useAccountTransfer } from 'src/queries/accountTransfer';

const useStyles = makeStyles()((theme: Theme) => ({
  link: {
    marginTop: theme.spacing(1),
  },
  openModalButton: {
    ...theme.applyLinkStyles,
  },
  paddedDocsText: {
    [theme.breakpoints.up('md')]: {
      paddingRight: theme.spacing(3), // Prevents link text from being split onto two lines.
    },
  },
  paper: {
    padding: theme.spacing(3),
  },
  poolUsageProgress: {
    '& .MuiLinearProgress-root': {
      borderRadius: 1,
    },
    marginBottom: theme.spacing(0.5),
  },
  proratedNotice: {
    marginBottom: theme.spacing(1),
    marginTop: theme.spacing(1),
  },
  root: {
    margin: 'auto',
    textAlign: 'center',
    [theme.breakpoints.down('md')]: {
      width: '85%',
    },
    width: '100%',
  },
}));

export interface Props {
  spacingTop?: number;
}

export const LegacyTransferDisplay = React.memo(({ spacingTop }: Props) => {
  const { classes } = useStyles();

  const [modalOpen, setModalOpen] = React.useState(false);
  const { data, isError, isLoading } = useAccountTransfer();
  const quota = data?.quota ?? 0;
  const used = data?.used ?? 0;

  // Usage percentage should not be 100% if there has been no usage or usage has not exceeded quota.
  const poolUsagePct =
    used < quota ? (used / quota) * 100 : used === 0 ? 0 : 100;

  if (isError) {
    // We may want to add an error state for this but I think that would clutter
    // up the display.
    return null;
  }

  return (
    <>
      <Typography
        className={classes.root}
        style={{ marginTop: spacingTop ?? 8 }}
      >
        {isLoading ? (
          'Loading transfer data...'
        ) : (
          <>
            You have used {poolUsagePct.toFixed(poolUsagePct < 1 ? 2 : 0)}% of
            your
            {`  `}
            <button
              className={classes.openModalButton}
              onClick={() => setModalOpen(true)}
            >
              Monthly Network Transfer Pool
            </button>
            .
          </>
        )}
      </Typography>
      <TransferDialog
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        poolUsagePct={poolUsagePct}
        quota={quota}
        used={used}
      />
    </>
  );
});

export const getDaysRemaining = () =>
  Math.floor(
    DateTime.local()
      .setZone('America/New_York')
      .endOf('month')
      .diffNow('days')
      .toObject().days ?? 0
  );

// =============================================================================
// Dialog
// =============================================================================
interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  poolUsagePct: number;
  quota: number;
  used: number;
}

export const TransferDialog = React.memo((props: DialogProps) => {
  const { isOpen, onClose, poolUsagePct, quota, used } = props;
  const { classes } = useStyles();
  const daysRemainingInMonth = getDaysRemaining();
  // Don't display usage, quota, or bar percent if the network transfer pool is empty (e.g. account has no resources).
  const isEmptyPool = quota === 0;
  const transferQuotaDocsText =
    used === 0 ? (
      <span className={classes.paddedDocsText}>
        Compute instances, NodeBalancers, and Object Storage include network
        transfer.
      </span>
    ) : (
      'View products and services that include network transfer, and learn how to optimize network usage to avoid billing surprises.'
    );

  return (
    <Dialog
      classes={{ paper: classes.paper }}
      fullWidth
      maxWidth="sm"
      onClose={onClose}
      open={isOpen}
      title="Monthly Network Transfer Pool"
    >
      <Grid
        container
        justifyContent="space-between"
        spacing={2}
        style={{ marginBottom: 0 }}
      >
        <Grid style={{ marginRight: 10 }}>
          {!isEmptyPool ? (
            <Typography>{used} GB Used</Typography>
          ) : (
            <Typography>
              Your monthly network transfer will be shown when you create a
              resource.
            </Typography>
          )}
        </Grid>
        <Grid>
          {!isEmptyPool ? (
            <Typography>
              {quota >= used ? (
                <span>{quota - used} GB Available</span>
              ) : (
                <span>
                  {(quota - used).toString().replace(/\-/, '')} GB Over Quota
                </span>
              )}
            </Typography>
          ) : null}
        </Grid>
      </Grid>
      {!isEmptyPool ? (
        <BarPercent
          className={classes.poolUsageProgress}
          max={100}
          rounded
          value={Math.ceil(poolUsagePct)}
        />
      ) : null}

      <Typography className={classes.proratedNotice}>
        <strong>
          Your account&rsquo;s monthly network transfer allotment will reset in{' '}
          {daysRemainingInMonth} days.
        </strong>
      </Typography>
      <Typography className={classes.proratedNotice}>
        Your account&rsquo;s network transfer pool adds up all the included
        transfer associated with active Linode services on your account and is
        prorated based on service creation.
      </Typography>
      <div className={classes.link}>
        <Typography>
          {transferQuotaDocsText}{' '}
          <Link
            aria-label="Learn more – link opens in a new tab"
            to="https://www.linode.com/docs/guides/network-transfer-quota/"
          >
            Learn more.
          </Link>
        </Typography>
      </div>
    </Dialog>
  );
});
