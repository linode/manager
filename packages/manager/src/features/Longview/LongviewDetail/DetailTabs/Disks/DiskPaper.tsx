import { pathOr } from 'ramda';
import * as React from 'react';
import { compose } from 'recompose';
import { makeStyles, Theme } from 'src/components/core/styles';

import Paper from 'src/components/core/Paper';
import Typography from 'src/components/core/Typography';

import { Disk } from '../../../request.types';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginBottom: theme.spacing(2),
    padding: theme.spacing(2),
    '& > h6': {
      color: theme.color.grey1,
      '& > strong': {
        color: theme.color.headline
      }
    }
  }
}));

interface Props {
  diskLabel?: string;
  stats: Partial<Disk>;
}

type CombinedProps = Props;

const DiskPaper: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  const { diskLabel, stats } = props;

  const isSwap = pathOr(0, ['isswap'], stats);

  return (
    <Paper className={classes.root}>
      <Typography variant="subtitle1">
        <strong>{diskLabel}</strong>
        {isSwap === 1 && (
          <React.Fragment>
            {' '}
            (swap) &ndash; Longview doesn't gather data on swap partitions.
          </React.Fragment>
        )}
      </Typography>

      {isSwap === 0 && <div>graphs go here, ya dig?</div>}
    </Paper>
  );
};

export default compose<CombinedProps, Props>(React.memo)(DiskPaper);
