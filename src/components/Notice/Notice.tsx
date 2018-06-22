import * as React from 'react';
import * as classNames from 'classnames';

import { withStyles, StyleRulesCallback, WithStyles } from '@material-ui/core/styles';
import Typography, { TypographyProps } from '@material-ui/core/Typography';
import Grid, { GridProps } from 'src/components/Grid';

import Flag from 'src/assets/icons/flag.svg';

type ClassNames = 'root'
  | 'inner'
  | 'error'
  | 'warning'
  | 'success'
  | 'flag';

const styles: StyleRulesCallback = (theme: Linode.Theme) => {
  const { palette: { status } } = theme;

  return {
    root: {
      marginBottom: theme.spacing.unit * 2,
      padding: theme.spacing.unit * 2,
      maxWidth: '100%',
      display: 'flex',
      alignItems: 'center',
      '& p': {
        wordWrap: 'break-word',
      },
    },
    inner: {
      width: '100%',
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
      marginRight: theme.spacing.unit * 2,
    },
  };
};

interface Props extends GridProps {
  text?: string;
  html?: string;
  error?: boolean;
  errorGroup?: string;
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
    errorGroup,
    warning,
    success,
    typeProps,
    children,
    flag,
    html,
  } = props;

  const c = html
    ? (
      <Typography {...typeProps} dangerouslySetInnerHTML={{ __html: html }} />
    )
    : (
      <Typography {...typeProps}>
        {text && text}
        {children && children}
      </Typography>
    );

  const errorScrollClassName = errorGroup ? `error-for-scroll-${errorGroup}` : `error-for-scroll`;

  return (
    <Grid
      item
      className={classNames({
        [classes.error]: error,
        [errorScrollClassName]: error,
        [classes.warning]: warning,
        [classes.success]: success,
        [classes.root]: true,
        notice: true,
        ...(className && { [className]: true }),
      })}
      data-qa-notice
    >
      {
        flag &&
        <Grid item>
          <Flag className={classes.flag} />
        </Grid>
      }
      <div className={classes.inner}>
        {c}
      </div>
    </Grid>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(Notice);
