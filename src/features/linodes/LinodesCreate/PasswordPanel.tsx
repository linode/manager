import * as React from 'react';

import { withStyles, StyleRulesCallback, WithStyles, Theme } from 'material-ui';

import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';

import PasswordInput from '../../../components/PasswordInput';
import Notice from '../../../components/Notice';

type ClassNames = 'root' | 'inner' | 'panelBody';

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
  panelBody: {
    padding: `${theme.spacing.unit * 3}px 0 ${theme.spacing.unit}px`,
  },
});

const styled = withStyles(styles, { withTheme: true });

interface Props {
  password: string | null;
  error?: string;
  handleChange: (value: string) => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class PasswordPanel extends React.Component<CombinedProps> {
  render() {
    const { classes, handleChange, error } = this.props;

    return (
      <Paper className={classes.root}>
      <div className={classes.inner} data-qa-password-input>
        { error && <Notice text={error} error /> }
        <Typography component="div" variant="title">Password</Typography>
        <PasswordInput
          label="Root Password"
          placeholder="Enter a password."
          onChange={e => handleChange(e.target.value)}
        />
      </div>
    </Paper>
    );
  }
}

export default styled<Props>(PasswordPanel);
