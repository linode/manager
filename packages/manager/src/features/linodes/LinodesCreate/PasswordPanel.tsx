import * as React from 'react';
import Paper from 'src/components/core/Paper';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from 'src/components/core/styles';
import Notice from 'src/components/Notice';
const PasswordInput = React.lazy(() => import('src/components/PasswordInput'));
import RenderGuard from 'src/components/RenderGuard';
import SuspenseLoader from 'src/components/SuspenseLoader';

type ClassNames = 'root' | 'inner' | 'panelBody';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      width: '100%',
      marginTop: theme.spacing(3),
      backgroundColor: theme.color.white,
    },
    inner: {
      padding: theme.spacing(3),
    },
    panelBody: {
      padding: `${theme.spacing(3)}px 0 ${theme.spacing(1)}px`,
    },
  });

const styled = withStyles(styles);

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
  handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.props.handleChange(e.target.value);
  };

  render() {
    const {
      classes,
      error,
      label,
      noPadding,
      required,
      placeholder,
    } = this.props;

    return (
      <Paper className={classes.root}>
        <div className={!noPadding ? classes.inner : ''} data-qa-password-input>
          {error && <Notice text={error} error />}
          <React.Suspense fallback={<SuspenseLoader />}>
            <PasswordInput
              required={required}
              value={this.props.password || ''}
              label={label || 'Root Password'}
              placeholder={placeholder || 'Enter a password.'}
              onChange={this.handleChange}
            />
          </React.Suspense>
        </div>
      </Paper>
    );
  }
}

export default styled(RenderGuard<CombinedProps>(PasswordPanel));
