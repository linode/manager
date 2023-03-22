import _Paper, { PaperProps as _PaperProps } from '@mui/material/Paper';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';
import { Theme } from '@mui/material/styles';
import FormHelperText from './FormHelperText';

const useStyles = makeStyles()((theme: Theme) => ({
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
  const { classes, cx } = useStyles();

  return (
    <React.Fragment>
      <_Paper
        className={cx(
          classes.root,
          {
            [classes.error]: Boolean(error),
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
