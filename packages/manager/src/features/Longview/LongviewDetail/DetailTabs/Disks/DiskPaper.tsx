import * as React from 'react';
import { compose } from 'recompose';
import { makeStyles, Theme } from 'src/components/core/styles';

import Paper from 'src/components/core/Paper';
import Typography from 'src/components/core/Typography';

import { LongviewDisk } from '../../../request.types';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginBottom: theme.spacing(2),
    padding: theme.spacing(2)
  }
}));

interface Props {
  diskLabel?: string;
  stats: Partial<LongviewDisk['Disk']>;
}

type CombinedProps = Props;

const DiskPaper: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  const { diskLabel } = props;

  return (
    <Paper className={classes.root}>
      <Typography variant="subtitle1">
        <strong>{diskLabel}</strong>
      </Typography>
    </Paper>
  );
};

export default compose<CombinedProps, Props>(React.memo)(DiskPaper);
