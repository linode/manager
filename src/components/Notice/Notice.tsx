import * as React from 'react';
import * as classNames from 'classnames';

import { withStyles, StyleRulesCallback, WithStyles } from 'material-ui';

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
  error?: boolean;
  warning?: boolean;
  success?: boolean;
  text: string;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const Notice: React.StatelessComponent<CombinedProps> = (props) => {
  const { classes, text, error, warning, success } = props;

  return (
    <div className={classNames({
      [classes.error]: error,
      [classes.warning]: warning,
      [classes.success]: success,
      [classes.root]: true,
    })}>
      {text}
    </div>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(Notice);
