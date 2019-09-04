import * as React from 'react';
import { Link } from 'react-router-dom';

import MonitorFailed from 'src/assets/icons/monitor-failed.svg';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import { useStyles } from './Healthy';

interface Props {
  monitorsDown: number;
}

export const Unhealthy: React.FC<Props> = props => {
  const classes = useStyles();
  const { monitorsDown } = props;
  return (
    <>
      <Grid
        container
        direction="row"
        alignItems="center"
        className={classes.root}
        spacing={0}
      >
        <Grid item>
          <Grid item xs={12} className={classes.icon}>
            <MonitorFailed height={48} width={48} />
          </Grid>
        </Grid>
        <Grid item className={classes.container}>
          <Typography variant="h3" className={classes.header}>
            {monitorsDown} of your Managed Service Monitors{' '}
            {monitorsDown === 1 ? 'has' : 'have'} failed.
          </Typography>
          <Typography>
            Please check your{` `}
            <Link to="/managed/monitors">Monitors</Link> for details.
          </Typography>
        </Grid>
      </Grid>
    </>
  );
};

export default Unhealthy;
