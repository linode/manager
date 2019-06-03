import * as React from 'react';
import { compose } from 'recompose';
import Paper from 'src/components/core/Paper';
import { WithStyles } from '@material-ui/core/styles';
import {
  createStyles,
  Theme,
  withStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import { withLinodeDetailContext } from 'src/features/linodes/LinodesDetail/linodeDetailContext';
import LinodeConfigs from './LinodeConfigs';
import LinodeDisks from './LinodeDisks';
import LinodeDiskSpace from './LinodeDiskSpace';

type ClassNames = 'root' | 'title' | 'paper' | 'main' | 'sidebar';

const styles = (theme: Theme) =>
  createStyles({
  root: {},
  title: {
    marginBottom: theme.spacing(2)
  },
  paper: {
    padding: theme.spacing(3),
    paddingTop: theme.spacing(1),
    marginBottom: theme.spacing(3)
  },
  main: {},
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
    const { classes, disks, linodeTotalDisk } = this.props;

    return (
      <Grid container>
        <Grid item xs={12} md={7} lg={9} className={classes.main}>
          <Typography variant="h2" className={classes.title}>
            Advanced Configurations
          </Typography>
          <Paper className={classes.paper}>
            <LinodeConfigs />
          </Paper>
          <Paper className={classes.paper}>
            <LinodeDisks />
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
  disks: Linode.Disk[];
}

const linodeContext = withLinodeDetailContext(({ linode }) => ({
  linodeTotalDisk: linode.specs.disk,
  disks: linode._disks
}));

const styled = withStyles<ClassNames>(styles);

const enhanced = compose<CombinedProps, {}>(
  styled,
  linodeContext
);

export default enhanced(LinodeAdvancedConfigurationsPanel);
