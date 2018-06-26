import * as React from 'react';

import { withStyles, StyleRulesCallback, WithStyles, Theme } from '@material-ui/core/styles';

import Paper from '@material-ui/core/Paper';
// import Typography from '@material-ui/core/Typography';

import PasswordInput from '../../../components/PasswordInput';
import Notice from '../../../components/Notice';

import RenderGuard from 'src/components/RenderGuard';

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
  heading?: string;
  label?: string;
  noPadding?: boolean;
  required?: boolean;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class PasswordPanel extends React.Component<CombinedProps> {
  render() {
    const { classes, handleChange, error, label, noPadding, required } = this.props;

    return (
      <Paper className={classes.root}>
        <div className={!noPadding ? classes.inner : ''} data-qa-password-input>
          { error && <Notice text={error} error /> }
          <PasswordInput
            required={required}
            value={this.props.password || ''}
            label={label || 'Root Password'}
            placeholder="Enter a password."
            onChange={e => handleChange(e.target.value)}
          />
        </div>
    </Paper>
    );
  }
}

export default styled(RenderGuard<CombinedProps>(PasswordPanel));
