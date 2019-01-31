import * as React from 'react';
import Paper from 'src/components/core/Paper';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import LinearProgress from 'src/components/LinearProgress';
import { transitionText } from 'src/features/linodes/transitions';

type ClassNames = 'root' | 'status';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {
    padding: theme.spacing.unit * 3,
    marginTop: theme.spacing.unit * 2
  },
  status: {
    textTransform: 'capitalize',
    marginBottom: theme.spacing.unit
  }
});

interface Props {
  status: string;
  recentEvent?: Linode.Event;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const LinodeBusyStatus: React.StatelessComponent<CombinedProps> = props => {
  const { classes, status, recentEvent } = props;
  const value = (recentEvent && recentEvent.percent_complete) || 1;
  return (
    <Paper className={classes.root}>
      <div className={classes.status}>
        <Typography>
          {transitionText(status, recentEvent)}: {value}%
        </Typography>
      </div>
      <LinearProgress value={value} />
    </Paper>
  );
};

const styled = withStyles(styles);

export default styled(LinodeBusyStatus);
