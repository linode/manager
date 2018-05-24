import * as React from 'react';

import { withStyles, StyleRulesCallback, WithStyles, Theme, Divider } from 'material-ui';
import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';

import defaultNumeric from 'src/utilities/defaultNumeric';
import TextField from 'src/components/TextField';

type ClassNames = 'root' | 'inner';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme & Linode.Theme) => ({
  root: {
    flexGrow: 1,
    width: '100%',
    marginTop: theme.spacing.unit * 3,
    backgroundColor: theme.color.white,
  },
  inner: {
    padding: theme.spacing.unit * 3,
  },
});

const styled = withStyles(styles, { withTheme: true });

interface Props {
  port: number;
  onPortChange: (v: number) => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class NodeBalancerConfigPanel extends React.Component<CombinedProps> {

  static defaultProps: Partial<Props> = {
  };

  render() {
    const {
      classes,
      port, onPortChange,
     } = this.props;

    return (
      <Paper className={classes.root} data-qa-label-header>
        <div className={classes.inner}>
          <Typography variant="title">Select Port</Typography>
          <TextField
            label="Port"
            value={port}
            onChange={e => onPortChange(defaultNumeric(80, +e.target.value))}
          />
          <Divider inset />
          <Typography variant="title">Algorithm</Typography>
          <Divider inset />
          <Typography variant="title">Session Stickiness</Typography>
          <Divider inset />
          <Typography variant="title">Active Health Checks</Typography>
          <Divider inset />
          <Typography variant="title">Passive Checks</Typography>
          <Divider inset  />
        </div>
      </Paper>
    );
  }
}

export default styled<Props>(NodeBalancerConfigPanel);
