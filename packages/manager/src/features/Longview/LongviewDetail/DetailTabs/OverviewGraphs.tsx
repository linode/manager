import * as React from 'react';

import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';

const useStyles = makeStyles((theme: Theme) => ({
  paperSection: {
    padding: theme.spacing(3) + 1,
    marginBottom: theme.spacing(1) + 3
  }
}));

interface Props {}

export type CombinedProps = Props;

export const OverviewGraphs: React.FC<Props> = props => {
  const classes = useStyles();
  return (
    <Grid
      container
      alignItems="flex-end"
      justify="space-between"
      item
      xs={12}
      spacing={0}
    >
      <Grid item>
        <Typography variant="h2">Resource Allocation History</Typography>
      </Grid>
      <Grid item />
      <Grid item xs={12}>
        <Paper className={classes.paperSection}>Graphs here</Paper>
      </Grid>
    </Grid>
  );
};

export default OverviewGraphs;
