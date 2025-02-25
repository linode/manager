import { Paper, Typography } from '@linode/ui';
import Grid from '@mui/material/Grid2';
import axios from 'axios';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import { Link } from 'src/components/Link';

import type { KubernetesCluster } from '@linode/api-v4/lib/kubernetes';
import type { Theme } from '@mui/material/styles';

const useStyles = makeStyles()((theme: Theme) => ({
  label: {
    font: theme.font.bold,
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

interface StatusState {
  message?: string;
  resolved?: boolean;
  url?: string;
}

const checkConsoleURL = async (
  cluster: KubernetesCluster,
  setStatus: React.Dispatch<React.SetStateAction<StatusState>>
) => {
  const consoleURL = `https://console.lke${cluster.id}.akamai-apl.net`;
  const healthCheckURL = `https://auth.lke${cluster.id}.akamai-apl.net/ready`;
  const pollURL = async () => {
    try {
      const response = await axios.get(healthCheckURL);

      if (response.status === 302 || response.status === 200) {
        clearInterval(interval); // Stop the polling
        setStatus({ resolved: true, url: consoleURL });
      }
    } catch (error) {
      setStatus({
        message:
          'Installation still in progress; please check back in a minute.',
        resolved: false,
      });
    }
  };

  const interval = setInterval(pollURL, 60000); // Poll every 60 seconds (60000 ms)

  // Run the check immediately without waiting for the first interval
  await pollURL();
};

interface Props {
  cluster: KubernetesCluster;
}

export const APLSummaryPanel = React.memo((props: Props) => {
  const { cluster } = props;
  const { classes } = useStyles();

  const [status, setStatus] = React.useState({
    message: 'Loading...',
    resolved: false,
    url: '',
  });

  React.useEffect(() => {
    if (cluster && cluster.id) {
      checkConsoleURL(cluster, setStatus);
    }
  }, [cluster]);

  return (
    <Paper className={classes.root}>
      <Grid className={classes.mainGridContainer} container spacing={2}>
        <Grid>
          <Typography className={classes.label}>Portal Endpoint:</Typography>
          {status.resolved ? (
            <Link to={status.url}>{status.url}</Link>
          ) : (
            <Typography>{status.message}</Typography>
          )}
        </Grid>
      </Grid>
    </Paper>
  );
});
