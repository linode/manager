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

type ClassNames = 'root' | 'title' | 'button';

interface Props {}

type CombinedProps = Props & WithStyles<ClassNames>;

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {
    padding: theme.spacing.unit * 3,
    marginBottom: theme.spacing.unit * 3
  },
  title: {
    marginBottom: theme.spacing.unit * 2
  },
  button: {
    marginTop: theme.spacing.unit * 3
  }
});

const ResetPassword: React.StatelessComponent<CombinedProps> = props => {
  const { classes } = props;
  return (
    <Paper className={classes.root}>
      <Typography
        role="header"
        variant="h2"
        className={classes.title}
        data-qa-title
      >
        Password
      </Typography>
      <Typography data-qa-text>
        Reset your password through our authentication system
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
