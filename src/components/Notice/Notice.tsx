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
      paddingLeft: spacing.unit * 3,
      paddingRight: spacing.unit * 3,
      paddingTop: spacing.unit * 2,
      paddingBottom: spacing.unit * 2,
      marginBottom: spacing.unit * 1 + 2,
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
  text: string;
  error?: boolean;
  warning?: boolean;
  success?: boolean;
  typeProps?: TypographyProps;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const Notice: React.StatelessComponent<CombinedProps> = (props) => {
  const { classes, text, error, warning, success, typeProps } = props;

  return (
    <div className={classNames({
      [classes.error]: error,
      [classes.warning]: warning,
      [classes.success]: success,
      [classes.root]: true,
    })}>
      <Typography {...typeProps}>{text}</Typography>
    </div>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(Notice);
