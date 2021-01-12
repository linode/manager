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
    marginTop: theme.spacing(),
    padding: `${theme.spacing()}px ${theme.spacing(2)}px`
  },
  barLabels: {
    display: 'flex',
    flexFlow: 'row nowrap',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(0.5)
  },
  poolUsageProgress: {
    marginBottom: theme.spacing(1) / 2
  },
  proratedNotice: {
    marginTop: theme.spacing(1)
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
      marginTop: 5,
      width: 15,
      height: 15
    }
  }
}));

export const TransferDisplay: React.FC<{}> = _ => {
  const classes = useStyles();

  const { data, isLoading } = useAccountTransfer();
  const quota = data?.quota ?? 0;
  const used = data?.used ?? 0;

  const poolUsagePct = used < quota ? (used / quota) * 100 : 100;

  if (isLoading) {
    return <CircleProgress />;
  }

  return (
    <Paper className={classes.root}>
      <Typography variant="h3" className={classes.title}>
        Monthly Network Transfer Pool
      </Typography>
      <Grid
        container
        direction="row"
        justify="space-between"
        alignItems="flex-start"
      >
        <Grid item xs={12} md={6} style={{ paddingRight: 40 }}>
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
            rounded
          />
          <Typography className={classes.proratedNotice}>
            Transfer pool will refresh in {getDaysRemaining()} days.
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography className={classes.proratedNotice}>
            Your account&apos;s transfer pool is prorated based on your
            Linodes&apos; creation and deletion dates.
          </Typography>
          <div className={classes.link}>
            <Typography>How to avoid surprises </Typography>{' '}
            <Link to="https://www.linode.com/docs/guides/network-transfer-quota/">
              <OpenInNew />
            </Link>
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
