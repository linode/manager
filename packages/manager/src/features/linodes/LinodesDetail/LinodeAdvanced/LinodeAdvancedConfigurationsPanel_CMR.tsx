// import { Disk } from '@linode/api-v4/lib/linodes';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { compose } from 'recompose';
import Paper from 'src/components/core/Paper';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import { withLinodeDetailContext } from 'src/features/linodes/LinodesDetail/linodeDetailContext';
import LinodeConfigs from './LinodeConfigs_CMR';
// import LinodeDisks from './LinodeDisks';

// import { sendMigrationNavigationEvent } from 'src/utilities/ga';

type ClassNames =
  | 'root'
  | 'title'
  | 'paper'
  | 'migrationHeader'
  | 'migrationCopy'
  | 'sidebar';

const styles = (theme: Theme) =>
  createStyles({
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
  });

type CombinedProps = LinodeContextProps & WithStyles<ClassNames>;

class LinodeAdvancedConfigurationsPanel extends React.PureComponent<
  CombinedProps
> {
  render() {
    const { classes, linodeID } = this.props;

    return (
      <Grid
        container
        id="tabpanel-advanced"
        role="tabpanel"
        aria-labelledby="tab-advanced"
      >
        <Grid item xs={12} md={7} lg={9}>
          <Paper className={classes.paper}>
            <LinodeConfigs />
          </Paper>
        </Grid>
      </Grid>
    );
  }
}

interface LinodeContextProps {
  // linodeTotalDisk: number;
  // disks: Disk[];
  linodeID: number;
}

const linodeContext = withLinodeDetailContext(({ linode }) => ({
  linodeID: linode.id
}));

const styled = withStyles(styles);

const enhanced = compose<CombinedProps, {}>(styled, linodeContext);

export default enhanced(LinodeAdvancedConfigurationsPanel);
