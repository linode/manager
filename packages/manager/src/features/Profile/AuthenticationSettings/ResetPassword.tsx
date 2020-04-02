import * as React from 'react';
import Button from 'src/components/Button';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { LOGIN_ROOT } from 'src/constants';

interface Props {
  username?: string;
}

type CombinedProps = Props;

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginBottom: theme.spacing(4)
  },
  copy: {
    lineHeight: '20px',
    marginTop: 6,
    marginBottom: theme.spacing(1)
  },
  button: {
    marginTop: theme.spacing(1)
  }
}));

export const ResetPassword: React.FC<CombinedProps> = props => {
  const classes = useStyles();
  const { username } = props;

  return (
    <Paper className={classes.root}>
      <Typography variant="h3" data-qa-title>
        Password Reset
      </Typography>
      <Typography variant="body2" className={classes.copy}>
        If you’ve forgotten your password or would like to change it, we’ll send
        you an e-mail with instructions.
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

export default ResetPassword;
