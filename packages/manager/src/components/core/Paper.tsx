import _Paper, { PaperProps as _PaperProps } from '@material-ui/core/Paper';
import * as React from 'react';
import FormHelperText from './FormHelperText';
import * as classNames from 'classnames';
import { makeStyles, Theme } from 'src/components/core/styles';

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
  border: {
    border: `1px solid ${theme.color.grey2}`,
  },
}));

export interface PaperProps extends _PaperProps {
  error?: string;
  border?: boolean;
}

type CombinedProps = PaperProps;

const Paper: React.FC<CombinedProps> = (props) => {
  const { error, className, border, ...rest } = props;
  const classes = useStyles();

  return (
    <React.Fragment>
      <_Paper
        className={classNames(
          {
            [classes.root]: true,
            [classes.error]: error,
            [classes.border]: border,
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
