import * as React from 'react';
import { compose } from 'recompose';

import Paper from 'src/components/core/Paper';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';

type ClassNames = 'root' | 'item';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {},
  item: {
    padding: theme.spacing.unit
  }
});

type CombinedProps = WithStyles<ClassNames>;

export const KubeSummaryPanel: React.FunctionComponent<
  CombinedProps
> = props => {
  const { classes } = props;
  return (
    <Paper className={classes.root}>
      <Paper className={classes.item}>
        <Typography variant="h3">Details</Typography>
      </Paper>
      <Paper className={classes.item}>
        <Typography>Version</Typography>
        <Typography>1.13</Typography>
      </Paper>
      <Paper className={classes.item}>
        <Typography>Total RAM</Typography>
        <Typography>190GB</Typography>
      </Paper>
      <Paper className={classes.item}>
        <Typography>Total CPU Cores</Typography>
        <Typography>54</Typography>
      </Paper>
      <Paper className={classes.item}>
        <Typography>Kubernetes API Endpoint</Typography>
        <Typography>8.8.8.8</Typography>
      </Paper>
      <Paper className={classes.item}>
        <Typography>Region</Typography>
        <Typography>Dallas, TX</Typography>
      </Paper>
      <Paper className={classes.item}>
        <Typography>Monthly Pricing</Typography>
        <Typography>$980/month</Typography>
      </Paper>
    </Paper>
  );
};

const styled = withStyles(styles);

const enhanced = compose<CombinedProps, {}>(
  React.memo,
  styled
);

export default enhanced(KubeSummaryPanel);
