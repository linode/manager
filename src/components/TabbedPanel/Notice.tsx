import * as React from 'react';
import * as classNames from 'classnames';

import { withStyles, StyleRulesCallback, Theme, WithStyles } from 'material-ui';

type ClassNames = 'root'
  | 'error'
  | 'warning'
  | 'success';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
  error: {},
  warning: {},
  success: {},
});

interface Props {
  error?: boolean;
  warning?: boolean;
  success?: boolean;
  message: string;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const styled = withStyles(styles, { withTheme: true });

const Notice: React.StatelessComponent<CombinedProps> = (props) => {
  const { classes, error, warning, success, message } = props;
  return (
    <div className={classNames({
      [classes.error]: error,
      [classes.warning]: warning,
      [classes.success]: success,
      [classes.root]: true,
    })}>{message}</div>
  );
};

export default styled(Notice);
