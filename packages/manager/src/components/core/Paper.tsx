import _Paper, { PaperProps as _PaperProps } from '@material-ui/core/Paper';
import * as React from 'react';
import { compose } from 'recompose';
import FormHelperText from './FormHelperText';

import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';

type ClassNames = 'error' | 'errorText';

const styles = (theme: Theme) =>
  createStyles({
    error: {
      borderColor: `#ca0813 !important`
    },
    errorText: {
      color: '#ca0813'
    }
  });

export interface PaperProps extends _PaperProps {
  error?: string;
}

type CombinedProps = PaperProps & WithStyles<ClassNames>;

class Paper extends React.Component<CombinedProps> {
  render() {
    const { classes, error, className, ...rest } = this.props;
    return (
      <React.Fragment>
        <_Paper
          className={error ? `${className} ${classes.error}` : className}
          {...rest}
        />
        {error && (
          <FormHelperText className={classes.errorText}>{error}</FormHelperText>
        )}
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles);

export default compose<CombinedProps, PaperProps>(styled)(Paper);
