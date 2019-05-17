import * as React from 'react';
import Button from 'src/components/Button';
import Paper from 'src/components/core/Paper';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { LOGIN_ROOT } from 'src/constants';

type ClassNames = 'root' | 'button';

type CombinedProps = WithStyles<ClassNames>;

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {
    padding: theme.spacing.unit * 3,
    marginBottom: theme.spacing.unit * 3
  },
  button: {
    marginTop: theme.spacing.unit * 3
  }
});

const ResetPassword: React.StatelessComponent<CombinedProps> = props => {
  const { classes } = props;
  return (
    <Paper className={classes.root}>
      <Typography variant="h2" data-qa-title>
        Account Password
      </Typography>
      <Button
        type="primary"
        href={`${LOGIN_ROOT}/forgot/password`}
        target="_blank"
        className={classes.button}
      >
        Reset Password
      </Button>
    </Paper>
  );
};

const styled = withStyles(styles);

export default styled(ResetPassword);
