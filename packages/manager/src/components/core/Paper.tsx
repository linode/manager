import _Paper, { PaperProps as _PaperProps } from '@material-ui/core/Paper';
import * as classNames from 'classnames';
import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import FormHelperText from './FormHelperText';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(3),
    paddingTop: 17,
  },
  error: {
    borderColor: `#ca0813 !important`,
  },
  errorText: {
    color: '#ca0813',
  },
}));

export interface PaperProps extends _PaperProps {
  error?: string;
}

type CombinedProps = PaperProps;

const Paper: React.FC<CombinedProps> = (props) => {
  const { error, className, ...rest } = props;
  const classes = useStyles();

  return (
    <React.Fragment>
      <_Paper
        className={classNames(
          {
            [classes.root]: true,
            [classes.error]: error,
          },
          className
        )}
        {...rest}
      />
      {error && (
        <FormHelperText className={classes.errorText}>{error}</FormHelperText>
      )}
    </React.Fragment>
  );
};

export default Paper;
