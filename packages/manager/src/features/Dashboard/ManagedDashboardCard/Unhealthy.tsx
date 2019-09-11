import * as React from 'react';
import { Link } from 'react-router-dom';
import { compose } from 'recompose';

import MonitorFailed from 'src/assets/icons/monitor-failed.svg';
import { withTheme, WithTheme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import { useStyles } from './Healthy';

import { COMPACT_SPACING_UNIT } from 'src/themeFactory';

interface Props {
  monitorsDown: number;
}

type CombineProps = Props & WithTheme;

export const Unhealthy: React.FC<CombineProps> = props => {
  const classes = useStyles();
  const { monitorsDown } = props;

  const iconSize = props.theme.spacing(1) === COMPACT_SPACING_UNIT ? 32 : 38;

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
          <Grid
            item
            xs={12}
            className={classes.icon}
            style={
              props.theme.spacing(1) === COMPACT_SPACING_UNIT
                ? { padding: '0 3px' }
                : undefined
            }
          >
            <MonitorFailed height={iconSize} width={iconSize} />
          </Grid>
        </Grid>
        <Grid item className={classes.container}>
          <Typography variant="h3">
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

const enhanced = compose<CombineProps, Props>(withTheme);

export default enhanced(Unhealthy);
