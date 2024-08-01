import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import { Link } from 'src/components/Link';
import { Paper } from 'src/components/Paper';
import { Typography } from 'src/components/Typography';

import type { KubernetesCluster } from '@linode/api-v4/lib/kubernetes';
import type { Theme } from '@mui/material/styles';

const useStyles = makeStyles()((theme: Theme) => ({
  label: {
    fontFamily: theme.font.bold,
    marginBottom: `calc(${theme.spacing(1)} - 3px)`,
  },
  mainGridContainer: {
    position: 'relative',
  },
  root: {
    marginBottom: theme.spacing(3),
    padding: `${theme.spacing(2.5)} ${theme.spacing(1)} ${theme.spacing(
      2.5
    )} ${theme.spacing(3)}`,
  },
}));

interface Props {
  cluster: KubernetesCluster;
}

export const APLSummaryPanel = React.memo((props: Props) => {
  const { cluster } = props;
  const { classes } = useStyles();

  const consoleURL = `https://console.lke${cluster.id}.akamai-apl.net`;

  return (
    <Paper className={classes.root}>
      <Grid className={classes.mainGridContainer} container spacing={2}>
        <Grid>
          <Typography className={classes.label}>
            APL Console Endpoint:
          </Typography>
          <Link to={consoleURL}>{consoleURL}</Link>
        </Grid>
      </Grid>
    </Paper>
  );
});
