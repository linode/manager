import { DateTime } from 'luxon';
import Close from '@material-ui/icons/Close';
import OpenInNew from '@material-ui/icons/OpenInNew';
import * as React from 'react';
import BarPercent from 'src/components/BarPercent';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Dialog from 'src/components/core/Dialog';
import Grid from 'src/components/Grid';
import Link from 'src/components/Link';
import { useAccountTransfer } from 'src/queries/accountTransfer';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexFlow: 'row nowrap'
  },
  wrapper: {
    border: 'none',
    backgroundColor: 'inherit',
    cursor: 'pointer',
    marginRight: theme.spacing(4),
    paddingRight: 0
  },
  labelText: {
    marginRight: theme.spacing(1),
    ...theme.applyLinkStyles
  },
  paper: {
    width: '30%',
    padding: theme.spacing(3)
  },
  bar: {
    width: 150
  },
  overLimit: {
    color: theme.palette.status.warningDark,
    fontFamily: theme.font.bold
  },
  poolUsageProgress: {
    marginBottom: theme.spacing(1) / 2
  },
  proratedNotice: {
    marginTop: theme.spacing(1)
  },
  title: {
    marginBottom: theme.spacing(),
    marginLeft: 0
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
      marginTop: 5,
      width: 15,
      height: 15
    }
  }
}));

export const TransferDisplay: React.FC<{}> = _ => {
  const [isOpen, setOpen] = React.useState(false);

  const classes = useStyles();

  const { data, isLoading } = useAccountTransfer();
  const quota = data?.quota ?? 0;
  const used = data?.used ?? 0;

  const poolUsagePct = used < quota ? (used / quota) * 100 : 100;

  return (
    <>
      <button
        className={`${classes.root} ${classes.wrapper}`}
        onClick={() => setOpen(true)}
      >
        <Typography className={classes.labelText}>
          Monthly Network Transfer Pool
        </Typography>
        {isLoading ? (
          <Typography className={classes.bar}>Loading...</Typography>
        ) : (
          <BarPercent
            className={classes.bar}
            max={100}
            value={poolUsagePct}
            displayValueInline
          />
        )}
      </button>
      <TransferDialog
        isOpen={isOpen}
        quota={quota}
        used={used}
        poolUsagePct={poolUsagePct}
        onClose={() => setOpen(false)}
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
              <span className={classes.overLimit}>
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
        {daysRemainingInMonth} days left to end of billing cycle.
      </Typography>
      <Typography className={classes.proratedNotice}>
        Your account&apos;s transfer quota is prorated based on your
        Linodes&apos; creation and deletion dates.
      </Typography>
      <div className={classes.link}>
        <Typography>How to mitigate overages </Typography>{' '}
        <Link to="https://linode.com/docs">
          <OpenInNew />
        </Link>
      </div>
    </Dialog>
  );
});
