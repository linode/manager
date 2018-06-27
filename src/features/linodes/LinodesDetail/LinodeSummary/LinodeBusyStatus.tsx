import * as React from 'react';
import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';

import LinearProgress from 'src/components/LinearProgress';
import { transitionText } from 'src/features/linodes/transitions';

type ClassNames = 'root' | 'status';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {
    padding: theme.spacing.unit * 3,
    marginBottom: theme.spacing.unit * 2,
  },
  status: {
    textTransform: 'capitalize',
    marginBottom: theme.spacing.unit,
  },
});

interface Props {
  status: string;
  recentEvent?: Linode.Event;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const LinodeBusyStatus: React.StatelessComponent<CombinedProps> = (props) => {
  const { classes, status, recentEvent } = props;
  const value = (recentEvent && recentEvent.percent_complete) || 1;
  return (
    <Paper className={classes.root}>
      <div className={classes.status}>
        {transitionText(status, recentEvent)}: {value}%
      </div>
      <LinearProgress value={value} />
    </Paper>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(LinodeBusyStatus);
