import * as React from 'react';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { Link } from 'src/components/Link';
import { LOGIN_ROOT } from 'src/constants';

interface Props {
  username?: string;
  disabled?: boolean;
}

type CombinedProps = Props;

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginBottom: theme.spacing(4)
  },
  copy: {
    lineHeight: '20px',
    marginTop: theme.spacing(),
    marginBottom: theme.spacing()
  },
  link: {
    marginTop: theme.spacing()
  },
  disabled: {
    '& *': {
      color: theme.color.disabledText
    }
  },
  disabledLink: {
    pointerEvents: 'none'
  }
}));

export const ResetPassword: React.FC<CombinedProps> = props => {
  const classes = useStyles();
  const { username, disabled } = props;

  return (
    <Paper className={`${classes.root} ${disabled ? classes.disabled : ''}`}>
      <Typography variant="h3">Password Reset</Typography>
      <Typography variant="body1" className={classes.copy}>
        If you’ve forgotten your password or would like to change it, we’ll send
        you an e-mail with instructions.
      </Typography>
      <Link
        to={`${LOGIN_ROOT}/forgot/password?username=${username}`}
        className={`${classes.link} ${disabled ? classes.disabledLink : ''}`}
      >
        Reset Password
      </Link>
    </Paper>
  );
};

export default ResetPassword;
