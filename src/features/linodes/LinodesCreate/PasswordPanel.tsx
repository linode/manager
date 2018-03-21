import * as React from 'react';

import { withStyles, StyleRulesCallback, WithStyles, Theme } from 'material-ui';

import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';

import TextField from '../../../components/TextField';

type ClassNames = 'root' | 'inner' | 'panelBody';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {
    flexGrow: 1,
    width: '100%',
    marginTop: theme.spacing.unit * 3,
    backgroundColor: theme.palette.background.paper,
  },
  inner: {
    padding: theme.spacing.unit * 3,
  },
  panelBody: {
    padding: `${theme.spacing.unit * 3}px 0 ${theme.spacing.unit}px`,
  },
});

const styled = withStyles(styles, { withTheme: true });

interface Props {
  password: string | null;
  handleChange: (key: string) => (e: React.ChangeEvent<HTMLInputElement>, label: string) => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class PasswordPanel extends React.Component<CombinedProps> {
  render() {
    const { classes, handleChange } = this.props;
    const setPassword = handleChange('password');

    return (
      <Paper className={classes.root}>
      <div className={classes.inner}>
        <Typography component="div" variant="title">Password</Typography>
        <TextField
          type="password"
          label="Root Password"
          placeholder="Enter a password."
          onChange={e => setPassword(e, e.target.value) }
        />
      </div>
    </Paper>
    );
  }
}

export default styled<Props>(PasswordPanel);
