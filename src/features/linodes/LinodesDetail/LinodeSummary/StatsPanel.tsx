import * as React from 'react';

import Paper from '@material-ui/core/Paper';
import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import CircleProgress from 'src/components/CircleProgress';
import ErrorState from 'src/components/ErrorState';

type ClassNames = 'root' | 'spinner' | 'title';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {
    padding: theme.spacing.unit * 2,
    marginBottom: theme.spacing.unit * 2,
  },
  spinner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  title: {
    padding: theme.spacing.unit * 2
  }
});

interface Props {
  renderBody: () => JSX.Element;
  loading: boolean;
  error?: string;
  title: string;
}

type CombinedProps = Props & WithStyles<ClassNames>;

export const StatsPanel: React.StatelessComponent<CombinedProps> = (props) => {
  const { classes, error, loading, renderBody, title } = props;
  return (
    <Paper className={classes.root} >
      <Typography
        className={classes.title}
        variant="title"
        data-qa-stats-title
      >
        {title}
      </Typography>
      {loading
        ? <div className={classes.spinner}><CircleProgress mini /></div>
        : error
          ? <ErrorState errorText={error} />
          : renderBody()
      }
    </Paper>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(StatsPanel);
