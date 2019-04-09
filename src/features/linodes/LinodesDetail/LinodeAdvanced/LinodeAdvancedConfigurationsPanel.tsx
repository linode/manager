import * as React from 'react';
import Paper from 'src/components/core/Paper';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import LinodeConfigs from './LinodeConfigs';
import LinodeDisks from './LinodeDisks';

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

type CombinedProps = WithStyles<ClassNames>;

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
    const { classes } = this.props;
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
      </React.Fragment>
    );
  }
}

const styled = withStyles<ClassNames>(styles);

export default styled(LinodeAdvancedConfigurationsPanel);
