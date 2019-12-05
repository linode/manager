import { Disk } from 'linode-js-sdk/lib/linodes';
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
import LinodeConfigs from './LinodeConfigs';
import LinodeDisks from './LinodeDisks';
import LinodeDiskSpace from './LinodeDiskSpace';

import { sendMigrationNavigationEvent } from 'src/utilities/ga';

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
    const { classes, disks, linodeTotalDisk, linodeID } = this.props;

    return (
      <Grid
        container
        id="tabpanel-linode-detail-advanced"
        role="tabpanel"
        aria-labelledby="tab-linode-detail-advanced"
      >
        <Grid item xs={12} md={7} lg={9}>
          <Typography variant="h2" className={classes.title}>
            Advanced Configurations
          </Typography>
          <Paper className={classes.paper}>
            <LinodeConfigs />
          </Paper>
          <Paper className={classes.paper}>
            <LinodeDisks />
          </Paper>
          <Paper className={classes.paper}>
            <Typography variant="h3" className={classes.migrationHeader}>
              Configure a Migration
            </Typography>
            <Typography className={classes.migrationCopy}>
              You can migrate your Linode across datacenters automatically.
              <Link
                to={`/linodes/${linodeID}/migrate`}
                onClick={() => sendMigrationNavigationEvent(`/advanced`)}
              >
                {' '}
                Click here to get started.
              </Link>
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={5} lg={3} className={classes.sidebar}>
          <Paper className={classes.paper}>
            <LinodeDiskSpace disks={disks} totalDiskSpace={linodeTotalDisk} />
          </Paper>
        </Grid>
      </Grid>
    );
  }
}

interface LinodeContextProps {
  linodeTotalDisk: number;
  disks: Disk[];
  linodeID: number;
}

const linodeContext = withLinodeDetailContext(({ linode }) => ({
  linodeTotalDisk: linode.specs.disk,
  disks: linode._disks,
  linodeID: linode.id
}));

const styled = withStyles(styles);

const enhanced = compose<CombinedProps, {}>(
  styled,
  linodeContext
);

export default enhanced(LinodeAdvancedConfigurationsPanel);
