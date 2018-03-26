import * as React from 'react';
import * as classNames from 'classnames';

import { withStyles, StyleRulesCallback, WithStyles, Theme } from 'material-ui';

type ClassNames = 'root'
  | 'error'
  | 'warning'
  | 'success';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme & Linode.Theme) => ({
  root: {
    paddingLeft: theme.spacing.unit * 3,
    paddingRight: theme.spacing.unit * 3,
    paddingTop: theme.spacing.unit * 2,
    paddingBottom: theme.spacing.unit * 2,
    /* TODO: remove this negative margin and apply to consuming Panel components */
    marginTop: theme.spacing.unit * -1,
    marginBottom: theme.spacing.unit * 1 + 2,
  },
  error: {
    backgroundColor: '#f8dedf',
    border: '1px solid #970d0d',
  },
  warning: {
    backgroundColor: '#fdf4da',
    border: '1px solid #ffd002',
  },
  success: {
    backgroundColor: '#d9e6f5',
    border: '1px solid #3682dd',
  },
});

interface Props {
  error?: boolean;
  warning?: boolean;
  success?: boolean;
  text: string;
}

type FinalProps = Props & WithStyles<ClassNames>;

const ErrorBanner: React.StatelessComponent<FinalProps> = (props) => {
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

export default withStyles(styles, { withTheme: true })(ErrorBanner);
