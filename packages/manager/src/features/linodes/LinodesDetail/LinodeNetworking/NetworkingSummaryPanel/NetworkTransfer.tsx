import * as React from 'react';
import { getLinodeTransfer } from '@linode/api-v4/lib/linodes';
import { DateTime } from 'luxon';
import { useSelector } from 'react-redux';
import BarPercent from 'src/components/BarPercent';
import CircleProgress from 'src/components/CircleProgress';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import { ApplicationState } from 'src/store';
import { isRecent } from 'src/utilities/isRecent.ts';
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
  }
}));

interface Props {
  linodeID: number;
}

export const NetworkTransfer: React.FC<Props> = props => {
  const { linodeID } = props;
  const [used, setUsed] = React.useState<number>(0);
  const [error, setError] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(false);
  const classes = useStyles();

  React.useEffect(() => {
    setLoading(true);
    setError(false);
    getLinodeTransfer(linodeID)
      .then(({ used }) => {
        setUsed(used);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        setError(true);
      });
  }, [linodeID]);

  return (
    <div>
      <Typography className={classes.header}>
        <strong>Monthly Network Transfer</strong>
      </Typography>
      <TransferContent
        used={used}
        linodeID={linodeID}
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
  linodeID: number;
  used: number;
  loading: boolean;
  error: boolean;
}

const TransferContent: React.FC<ContentProps> = props => {
  const { error, linodeID, loading, used } = props;
  const classes = useStyles();

  const { total, isTooEarlyForStats } = useSelector(
    (state: ApplicationState) => {
      const linode = state.__resources.linodes.itemsById[linodeID];
      return {
        total: linode ? linode.specs.transfer : 0,
        isTooEarlyForStats:
          linode && isRecent(linode.created, DateTime.local().toISO())
      };
    }
  );

  const usedInGb = used / 1024 / 1024 / 1024;

  const totalInBytes = total * 1024 * 1024 * 1024;

  const usagePercent =
    totalInBytes > used ? 100 - ((total - usedInGb) * 100) / total : 100;

  const readableUsed = readableBytes(used, {
    maxUnit: 'GB',
    round: { MB: 0, GB: 1 }
  });

  const readableFree = readableBytes(totalInBytes - used, {
    maxUnit: 'GB',
    round: { MB: 0, GB: 1 },
    handleNegatives: true
  });

  if (error && isTooEarlyForStats) {
    return (
      <>
        <Typography className={classes.header}>
          Monthly Network Transfer
        </Typography>
        <Typography align="center">
          Network Transfer data is not yet available – check back later.
        </Typography>
      </>
    );
  }

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
        value={Math.ceil(usagePercent)}
        className={classes.poolUsageProgress}
        rounded
        overLimit={totalInBytes < used}
      />
      <Grid container justify="space-between">
        <Grid item style={{ marginRight: 10 }}>
          <Typography>
            {readableUsed.value} {readableUsed.unit} Used
          </Typography>
        </Grid>
        <Grid item>
          <Typography>
            {totalInBytes >= used ? (
              <span>{readableFree.formatted} Available</span>
            ) : (
              <span className={classes.overLimit}>
                {readableFree.formatted.toString().replace(/\-/, '')} Over Quota
              </span>
            )}
          </Typography>
        </Grid>
      </Grid>
    </div>
  );
};

export default React.memo(NetworkTransfer);
