import * as React from 'react';
import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';
import Paper from 'material-ui/Paper';

import LinearProgress from 'src/components/LinearProgress';

type ClassNames = 'root' | 'status';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {
    padding: theme.spacing.unit * 3,
    marginTop: theme.spacing.unit * 2,
    marginBottom: theme.spacing.unit * 2,
  },
  status: {
    textTransform: 'capitalize',
    marginBottom: theme.spacing.unit,
  },
});

interface Props {
  linode: Linode.Linode & { recentEvent?: Linode.Event };
}

type CombinedProps = Props & WithStyles<ClassNames>;

const LinodeBusyStatus: React.StatelessComponent<CombinedProps> = (props) => {
  const { classes, linode } = props;
  const value = (linode.recentEvent && linode.recentEvent.percent_complete) || 1;
  return (
    <Paper className={classes.root}>
      <div className={classes.status}>
        {linode.status.replace('_', ' ')}: {value}%
      </div>
      <LinearProgress value={value} />
    </Paper>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(LinodeBusyStatus);
