import Close from '@material-ui/icons/Close';
import OpenInNew from '@material-ui/icons/OpenInNew';
import { DateTime } from 'luxon';
import * as React from 'react';
import BarPercent from 'src/components/BarPercent';
import CircleProgress from 'src/components/CircleProgress';
import Dialog from 'src/components/core/Dialog';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import Link from 'src/components/Link';
import { useAccountTransfer } from 'src/queries/accountTransfer';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginTop: theme.spacing(),
    width: '100%',
    margin: 'auto',
    textAlign: 'center'
  },
  barLabels: {
    display: 'flex',
    flexFlow: 'row nowrap',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(0.5)
  },
  poolUsageProgress: {
    marginBottom: theme.spacing(1) / 2,
    '& .MuiLinearProgress-root': {
      borderRadius: 1
    }
  },
  title: {
    marginBottom: theme.spacing(),
    paddingLeft: theme.spacing(),
    fontSize: '0.95rem'
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    flexFlow: 'row nowrap',
    marginTop: theme.spacing(1),
    '& p': {
      marginRight: 4
    },
    '& svg': {
      width: 15,
      height: 15,
      color: theme.palette.text.primary,
      '&:hover': {
        color: 'inherit'
      }
    }
  },
  paper: {
    padding: theme.spacing(3)
  },
  wrapper: {
    border: 'none',
    backgroundColor: 'inherit',
    cursor: 'pointer'
  },
  proratedNotice: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1)
  },
  openModalButton: {
    ...theme.applyLinkStyles
  }
}));

export const TransferDisplay: React.FC<{}> = _ => {
  const classes = useStyles();

  const [modalOpen, setModalOpen] = React.useState(false);
  const { data, isLoading, isError } = useAccountTransfer();
  const quota = data?.quota ?? 0;
  const used = data?.used ?? 0;

  const poolUsagePct = used < quota ? (used / quota) * 100 : 100;

  if (isLoading) {
    return (
      <Paper className={classes.root + ' flex-center'}>
        <CircleProgress mini />
      </Paper>
    );
  }

  if (isError) {
    // We may want to add an error state for this but I think that would clutter
    // up the display.
    return null;
  }

  return (
    <>
      <Typography className={classes.root}>
        You have used {poolUsagePct.toFixed(poolUsagePct < 1 ? 2 : 0)}% of your
        {`  `}
        <button
          className={classes.openModalButton}
          onClick={() => setModalOpen(true)}
        >
          Monthly Network Transfer Pool
        </button>
        .
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
};

export const getDaysRemaining = () =>
  Math.floor(
    DateTime.local()
      .endOf('month')
      .diffNow('days')
      .toObject().days ?? 0
  );

export default React.memo(TransferDisplay);

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

export const TransferDialog: React.FC<DialogProps> = React.memo(props => {
  const classes = useStyles();
  const { isOpen, onClose, poolUsagePct, quota, used } = props;

  const daysRemainingInMonth = getDaysRemaining();

  return (
    <Dialog
      open={isOpen}
      classes={{ paper: classes.paper }}
      onClose={onClose}
      title="Monthly Network Transfer Pool"
    >
      <Grid
        container
        justify="space-between"
        alignItems="center"
        className={classes.title}
      >
        <Typography variant="h2">Monthly Network Transfer Pool</Typography>
        <button className={classes.wrapper} onClick={onClose}>
          <Close />
        </button>
      </Grid>
      <Grid container justify="space-between" style={{ marginBottom: 0 }}>
        <Grid item style={{ marginRight: 10 }}>
          <Typography>{used} GB Used</Typography>
        </Grid>
        <Grid item>
          <Typography>
            {quota >= used ? (
              <span>{quota - used} GB Available</span>
            ) : (
              <span>
                {(quota - used).toString().replace(/\-/, '')} GB Over Quota
              </span>
            )}
          </Typography>
        </Grid>
      </Grid>
      <BarPercent
        max={100}
        value={Math.ceil(poolUsagePct)}
        className={classes.poolUsageProgress}
        rounded
        overLimit={quota < used}
      />

      <Typography className={classes.proratedNotice}>
        <strong>
          Your account&rsquo;s monthly network transfer allotment will reset in{' '}
          {daysRemainingInMonth} days.
        </strong>
      </Typography>
      <Typography className={classes.proratedNotice}>
        Your account&apos;s network transfer pool adds up all the included
        transfer associated with the active Linode services on your account, and
        is prorated based on service creation and deletion dates.
      </Typography>
      <div className={classes.link}>
        <Typography>
          Optimize your network usage and avoid billing surprises related to
          network transfer.
        </Typography>
        <Link to="https://linode.com/docs">
          <OpenInNew />
        </Link>
      </div>
    </Dialog>
  );
});
