// import { Disk } from '@linode/api-v4/lib/linodes';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { compose } from 'recompose';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import { withLinodeDetailContext } from 'src/features/linodes/LinodesDetail/linodeDetailContext';
import LinodeConfigs from './LinodeConfigs_CMR';
// import LinodeDisks from './LinodeDisks';

// import { sendMigrationNavigationEvent } from 'src/utilities/ga';

const useStyles = makeStyles((theme: Theme) => ({
  title: {
    marginBottom: theme.spacing(2)
  },
  paper: {
    padding: theme.spacing(3),
    paddingTop: theme.spacing(1),
    marginBottom: theme.spacing(3)
  },
  migrationHeader: {
    paddingTop: theme.spacing()
  },
  migrationCopy: {
    marginTop: theme.spacing()
  },
  sidebar: {
    marginTop: -theme.spacing(2),
    [theme.breakpoints.up('md')]: {
      marginTop: theme.spacing(2) + 24
    }
  }
}));

type CombinedProps = LinodeContextProps;

const LinodeAdvancedConfigurationsPanel: React.FC<CombinedProps> = props => {
  const { linodeID } = props;

  const classes = useStyles();

  return (
    <Grid
      container
      id="tabpanel-advanced"
      role="tabpanel"
      aria-labelledby="tab-advanced"
    >
      <Grid item>
        <Paper className={classes.paper}>
          <LinodeConfigs />
        </Paper>
      </Grid>
    </Grid>
  );
};

interface LinodeContextProps {
  // linodeTotalDisk: number;
  // disks: Disk[];
  linodeID: number;
}

const linodeContext = withLinodeDetailContext(({ linode }) => ({
  linodeID: linode.id
}));

const enhanced = compose<CombinedProps, {}>(linodeContext);

export default enhanced(LinodeAdvancedConfigurationsPanel);
