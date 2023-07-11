import Grid from '@mui/material/Unstable_Grid2';
import { Theme } from '@mui/material/styles';
import { DateTime } from 'luxon';
import * as React from 'react';
import BarPercent from 'src/components/BarPercent';
import { Dialog } from 'src/components/Dialog/Dialog';
import { Typography } from 'src/components/Typography';
import { Link } from 'src/components/Link';
import { useAccountTransfer } from 'src/queries/accountTransfer';
import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()((theme: Theme) => ({
  root: {
    width: '100%',
    margin: 'auto',
    textAlign: 'center',
    [theme.breakpoints.down('md')]: {
      width: '85%',
    },
  },
  poolUsageProgress: {
    marginBottom: theme.spacing(0.5),
    '& .MuiLinearProgress-root': {
      borderRadius: 1,
    },
  },
  link: {
    marginTop: theme.spacing(1),
  },
  paddedDocsText: {
    [theme.breakpoints.up('md')]: {
      paddingRight: theme.spacing(3), // Prevents link text from being split onto two lines.
    },
  },
  paper: {
    padding: theme.spacing(3),
  },
  proratedNotice: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  openModalButton: {
    ...theme.applyLinkStyles,
  },
}));

export interface Props {
  spacingTop?: number;
}

export const TransferDisplay = React.memo(({ spacingTop }: Props) => {
  const { classes } = useStyles();

  const [modalOpen, setModalOpen] = React.useState(false);
  const { data, isLoading, isError } = useAccountTransfer();
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
        used={used}
        quota={quota}
        poolUsagePct={poolUsagePct}
        onClose={() => setModalOpen(false)}
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
  used: number;
  quota: number;
  poolUsagePct: number;
  onClose: () => void;
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
      open={isOpen}
      classes={{ paper: classes.paper }}
      onClose={onClose}
      title="Monthly Network Transfer Pool"
      maxWidth="sm"
      fullWidth
    >
      <Grid
        container
        justifyContent="space-between"
        style={{ marginBottom: 0 }}
        spacing={2}
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
          max={100}
          value={Math.ceil(poolUsagePct)}
          className={classes.poolUsageProgress}
          rounded
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
            to="https://www.linode.com/docs/guides/network-transfer-quota/"
            aria-label="Learn more – link opens in a new tab"
          >
            Learn more.
          </Link>
        </Typography>
      </div>
    </Dialog>
  );
});
