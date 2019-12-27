import * as React from 'react';
import Button from 'src/components/Button';
import Paper from 'src/components/core/Paper';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { LOGIN_ROOT } from 'src/constants';

type ClassNames = 'root' | 'button';

interface Props {
  username?: string;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const styles = (theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(3),
      marginBottom: theme.spacing(3)
    },
    button: {
      marginTop: theme.spacing(3)
    }
  });

const ResetPassword: React.StatelessComponent<CombinedProps> = props => {
  const { classes, username } = props;

  return (
    <Paper className={classes.root}>
      <Typography variant="h2" data-qa-title>
        Account Password
      </Typography>
      <Button
        buttonType="primary"
        href={`${LOGIN_ROOT}/forgot/password?username=${username}`}
        className={classes.button}
      >
        Reset Password
      </Button>
    </Paper>
  );
};

const styled = withStyles(styles);

export default styled(ResetPassword);
