import * as React from 'react';
import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';

import LinearProgress from 'src/components/LinearProgress';
import transitionAction from 'src/features/linodes/transitionAction';

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

type ExtendedLinode = Linode.Linode & { recentEvent?: Linode.Event };

interface Props {
  linode: ExtendedLinode;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const statusLabel = (linode: ExtendedLinode) => {
  if (linode.recentEvent && transitionAction.includes(linode.recentEvent.action)) {
    return linode.recentEvent.action.replace('linode_', '');
  }
  return linode.status.replace('_', ' ');
}

const LinodeBusyStatus: React.StatelessComponent<CombinedProps> = (props) => {
  const { classes, linode } = props;
  const value = (linode.recentEvent && linode.recentEvent.percent_complete) || 1;
  return (
    <Paper className={classes.root}>
      <div className={classes.status}>
        {statusLabel(linode)}: {value}%
      </div>
      <LinearProgress value={value} />
    </Paper>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(LinodeBusyStatus);
