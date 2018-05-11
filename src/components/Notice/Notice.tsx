import * as React from 'react';
import * as classNames from 'classnames';

import { withStyles, StyleRulesCallback, WithStyles } from 'material-ui';
import Typography, { TypographyProps } from 'material-ui/Typography';
import { GridProps } from 'material-ui/Grid';

import Grid from 'src/components/Grid';
import Flag from 'src/assets/icons/flag.svg';

type ClassNames = 'root'
  | 'error'
  | 'warning'
  | 'success'
  | 'flag';

const styles: StyleRulesCallback = (theme: Linode.Theme) => {
  const { palette: { status } } = theme;

  return {
    root: {
      wordBreak: 'break-word',
    },
    error: {
      backgroundColor: status.error,
      border: `1px solid ${status.errorDark}`,
    },
    warning: {
      backgroundColor: status.warning,
      border: `1px solid ${status.warningDark}`,
    },
    success: {
      backgroundColor: status.success,
      border: `1px solid ${status.successDark}`,
    },
    flag: {
      transition: theme.transitions.create(['opacity']),
      opaity: 1,
      '&:hover': {
        opacity: .75,
      },
    },
  };
};

interface Props extends GridProps {
  text?: string;
  error?: boolean;
  warning?: boolean;
  success?: boolean;
  typeProps?: TypographyProps;
  className?: string;
  flag?: boolean;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const Notice: React.StatelessComponent<CombinedProps> = (props) => {
  const {
    classes,
    className,
    text,
    error,
    warning,
    success,
    typeProps,
    children,
    flag,
  } = props;

  return (
    <Grid
      container
      className={classNames({
        [classes.error]: error,
        [classes.warning]: warning,
        [classes.success]: success,
        [classes.root]: true,
        notice: true,
        ...(className && { [className]: true }),
      })}
    >
      {
        flag &&
        <Grid item>
          <Flag className={classes.flag} />
        </Grid>
      }
      <Grid item>
        <Typography {...typeProps}>
          {text && text}
          {children && children}
        </Typography></Grid>
    </Grid>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(Notice);
