import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import Grid from 'src/components/Grid';
import LinodeConfigs from './LinodeConfigs';

const useStyles = makeStyles((theme: Theme) => ({
  title: {
    marginBottom: theme.spacing(2),
  },
  enclosingGrid: {
    width: '100%',
  },
  paper: {
    padding: theme.spacing(3),
    paddingTop: theme.spacing(1),
    marginBottom: theme.spacing(3),
  },
  migrationHeader: {
    paddingTop: theme.spacing(),
  },
  migrationCopy: {
    marginTop: theme.spacing(),
  },
  sidebar: {
    marginTop: -theme.spacing(2),
    [theme.breakpoints.up('md')]: {
      marginTop: theme.spacing(2) + 24,
    },
  },
}));

const LinodeAdvancedConfigurationsPanel = () => {
  const classes = useStyles();

  return (
    <Grid container item className="m0" xs={12}>
      <Grid item className={`${classes.enclosingGrid} p0`}>
        <LinodeConfigs />
      </Grid>
    </Grid>
  );
};

export default LinodeAdvancedConfigurationsPanel;
