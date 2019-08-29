import { Event } from 'linode-js-sdk/lib/account';
import * as React from 'react';
import { compose } from 'recompose';
import Paper from 'src/components/core/Paper';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import LinearProgress from 'src/components/LinearProgress';
import { transitionText } from 'src/features/linodes/transitions';
import { withLinodeDetailContext } from '../linodeDetailContext';

type ClassNames = 'root' | 'status';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(3),
      marginTop: theme.spacing(2)
    },
    status: {
      textTransform: 'capitalize',
      marginBottom: theme.spacing(1)
    }
  });

interface LinodeDetailContextProps {
  status: string;
  linodeEvents?: Event[];
}

type CombinedProps = LinodeDetailContextProps & WithStyles<ClassNames>;

const LinodeBusyStatus: React.StatelessComponent<CombinedProps> = props => {
  const { classes, status, linodeEvents } = props;

  const firstEventWithProgress = (linodeEvents || []).find(
    eachEvent => typeof eachEvent.percent_complete === 'number'
  );

  const value = firstEventWithProgress
    ? (firstEventWithProgress.percent_complete as number)
    : 1;

  return (
    <Paper className={classes.root}>
      <div className={classes.status}>
        <Typography>
          {transitionText(status, firstEventWithProgress)}: {value}%
        </Typography>
      </div>
      <LinearProgress value={value} />
    </Paper>
  );
};

const styled = withStyles(styles);

const enhanced = compose<CombinedProps, {}>(
  styled,
  withLinodeDetailContext(({ linode }) => ({
    status: linode.status,
    linodeEvents: linode._events
  }))
);

export default enhanced(LinodeBusyStatus);
