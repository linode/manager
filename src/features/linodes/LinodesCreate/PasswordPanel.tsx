import * as React from 'react';

import Paper from '@material-ui/core/Paper';
import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';

import Notice from 'src/components/Notice';
import PasswordInput from 'src/components/PasswordInput';
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
  placeholder?: string;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class PasswordPanel extends React.Component<CombinedProps> {
  render() {
    const {
      classes,
      handleChange,
      error,
      label,
      noPadding,
      required,
      placeholder,
    } = this.props;

    return (
      <Paper className={classes.root}>
        <div className={!noPadding ? classes.inner : ''} data-qa-password-input>
          { error && <Notice text={error} error /> }
          <PasswordInput
            required={required}
            value={this.props.password || ''}
            label={label || 'Root Password'}
            placeholder={placeholder || "Enter a password."}
            onChange={e => handleChange(e.target.value)}
          />
        </div>
    </Paper>
    );
  }
}

export default styled(RenderGuard<CombinedProps>(PasswordPanel));
