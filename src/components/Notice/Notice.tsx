import * as React from 'react';
import * as classNames from 'classnames';

import { withStyles, StyleRulesCallback, WithStyles } from 'material-ui';
import Typography, { TypographyProps } from 'material-ui/Typography';

type ClassNames = 'root'
  | 'error'
  | 'warning'
  | 'success';

const styles: StyleRulesCallback = (theme: Linode.Theme) => {
  const { spacing, palette: { status } } = theme;

  return {
    root: {
      padding: `${spacing.unit * 2}px ${spacing.unit * 3}px`,
      margin: `${spacing.unit}px 0`,
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
  };
};

interface Props {
  text?: string;
  error?: boolean;
  warning?: boolean;
  success?: boolean;
  typeProps?: TypographyProps;
  className?: string;
  [name: string]: any;
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
    ...restProps,
  } = props;

  return (
    <div
      className={`${classNames({
        [classes.error]: error,
        [classes.warning]: warning,
        [classes.success]: success,
        [classes.root]: true,
        notice: true,
      })} ${className}`}
      {...restProps}
    >
      <Typography {...typeProps}>
        {text && text}
        {children && children}
      </Typography>
    </div>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(Notice);
