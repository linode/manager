import * as React from 'react';
import { compose } from 'recompose';
import Paper from 'src/components/core/Paper';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { withLinodeDetailContext } from 'src/features/linodes/LinodesDetail/linodeDetailContext';
import LinodeConfigs from './LinodeConfigs';
import LinodeDisks from './LinodeDisks';
import LinodeDiskSpace from './LinodeDiskSpace';

type ClassNames = 'root' | 'title' | 'paper';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {},
  title: {
    marginBottom: theme.spacing.unit * 2
  },
  paper: {
    padding: theme.spacing.unit * 3,
    paddingTop: theme.spacing.unit,
    marginBottom: theme.spacing.unit * 3
  }
});

type CombinedProps = LinodeContextProps & WithStyles<ClassNames>;

interface State {
  loaded: boolean;
}

class LinodeAdvancedConfigurationsPanel extends React.Component<
  CombinedProps,
  State
> {
  state: State = {
    loaded: false
  };

  componentDidMount = () => {
    this.setState({ loaded: true });
  };

  render() {
    const { classes, disks, linodeTotalDisk } = this.props;
    const { loaded } = this.state;

    return (
      <React.Fragment>
        <Typography variant="h2" className={classes.title}>
          Advanced Configurations
        </Typography>
        <Paper className={classes.paper}>
          <LinodeConfigs active={loaded} />
        </Paper>
        <Paper className={classes.paper}>
          <LinodeDisks active={loaded} />
        </Paper>
        <Paper className={classes.paper}>
          <LinodeDiskSpace
            disks={disks}
            loading={!loaded}
            totalDiskSpace={linodeTotalDisk}
          />
        </Paper>
      </React.Fragment>
    );
  }
}

interface LinodeContextProps {
  linodeTotalDisk?: number;
  disks: Linode.Disk[] | undefined;
}

const linodeContext = withLinodeDetailContext(({ linode }) => ({
  linodeTotalDisk: linode.specs.disk,
  disks: linode._disks
}));

const styled = withStyles<ClassNames>(styles);

const enhanced = compose<CombinedProps, any>(
  styled,
  linodeContext
);

export default enhanced(LinodeAdvancedConfigurationsPanel);
