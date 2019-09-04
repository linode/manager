import * as React from 'react';
import { Link } from 'react-router-dom';
import { compose } from 'recompose';

import MonitorOK from 'src/assets/icons/monitor-ok.svg';
import {
  makeStyles,
  Theme,
  withTheme,
  WithTheme
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';

import { COMPACT_SPACING_UNIT } from 'src/themeFactory';

export const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(2),
    maxWidth: '100%'
  },
  container: {
    flex: 1
  },
  icon: {
    '& svg': {
      display: 'flex'
    }
  }
}));

export const Healthy: React.FC<WithTheme> = props => {
  const classes = useStyles();

  const iconSize = props.theme.spacing(1) === COMPACT_SPACING_UNIT ? 32 : 38;

  return (
    <>
      <Grid
        container
        direction="row"
        alignItems="center"
        className={classes.root}
      >
        <Grid item>
          <Grid
            item
            style={
              props.theme.spacing(1) === COMPACT_SPACING_UNIT
                ? { padding: '0 3px' }
                : undefined
            }
            className={classes.icon}
          >
            <MonitorOK width={iconSize} height={iconSize} />
          </Grid>
        </Grid>
        <Grid item className={classes.container}>
          <Typography variant="h3">
            All Managed Service Monitors are verified.
          </Typography>
          <Typography>
            <Link to="/managed/monitors">View your Managed Services</Link> for
            details.
          </Typography>
        </Grid>
      </Grid>
    </>
  );
};

const enhanced = compose<WithTheme, {}>(withTheme);

export default enhanced(Healthy);
