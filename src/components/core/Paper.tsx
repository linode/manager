import Paper, { PaperProps as _PaperProps } from '@material-ui/core/Paper';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from '@material-ui/styles';
import * as React from 'react';
import { compose } from 'recompose';
import FormHelperText from './FormHelperText';

type ClassNames = 'error' | 'errorText';

const styles: StyleRulesCallback<ClassNames> = theme => ({
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

const _Paper: React.FC<CombinedProps> = props => {
  const { classes, error, className, ...rest } = props;
  return (
    <React.Fragment>
      <Paper
        className={error ? `${className} ${classes.error}` : className}
        {...rest}
      />
      {error && (
        <FormHelperText className={classes.errorText}>{error}</FormHelperText>
      )}
    </React.Fragment>
  );
};

const styled = withStyles(styles);

export default compose<CombinedProps, PaperProps>(styled)(_Paper);
