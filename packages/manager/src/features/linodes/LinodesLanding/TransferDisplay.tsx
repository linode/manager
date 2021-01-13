import { DateTime } from 'luxon';
import OpenInNew from '@material-ui/icons/OpenInNew';
import * as React from 'react';
import BarPercent from 'src/components/BarPercent';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Paper from 'src/components/core/Paper';
import Grid from 'src/components/Grid';
import CircleProgress from 'src/components/CircleProgress';
import Link from 'src/components/Link';
import { useAccountTransfer } from 'src/queries/accountTransfer';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginTop: theme.spacing(2),
    padding: `${theme.spacing()}px ${theme.spacing(2)}px`,
    width: '100%',
    display: 'flex',
    justifyContent: 'center'
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
      position: 'relative',
      top: 3
    },
    [theme.breakpoints.down('sm')]: {
      marginBottom: theme.spacing(0.5)
    }
  }
}));

export const TransferDisplay: React.FC<{}> = _ => {
  const classes = useStyles();

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
    <Paper className={classes.root}>
      <Grid
        container
        direction="row"
        justify="space-between"
        alignItems="center"
      >
        <Grid item xs={12} md={6} style={{ paddingRight: 40 }}>
          <Typography variant="h3" className={classes.title}>
            Monthly Network Transfer Pool
          </Typography>
          <div className={classes.barLabels}>
            <Typography>{used} GB Used</Typography>

            <Typography>
              {quota >= used ? (
                <span>{quota - used} GB Available</span>
              ) : (
                <span>
                  {(quota - used).toString().replace(/\-/, '')} GB Over Quota
                </span>
              )}
            </Typography>
          </div>
          <BarPercent
            max={100}
            value={Math.ceil(poolUsagePct)}
            className={classes.poolUsageProgress}
          />
          <Typography style={{ marginBottom: 6 }}>
            Your account&rsquo;s monthly network transfer allotment will reset
            in {getDaysRemaining()} days.
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography>
            Your account&rsquo;s network transfer pool adds up all the included
            transfer associated with the active Linode services on your account,
            and is prorated based on service creation and/or deletion date(s).
          </Typography>
          <div className={classes.link}>
            <Typography>
              Optimize your network usage and avoid billing surprises related to
              network transfer.{' '}
              <Link to="https://www.linode.com/docs/guides/network-transfer-quota/">
                <OpenInNew />
              </Link>
            </Typography>
          </div>
        </Grid>
      </Grid>
    </Paper>
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
