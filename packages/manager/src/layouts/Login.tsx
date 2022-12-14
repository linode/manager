/**
 * This component is similar to the OAuth comonent, in that it's main
 * purpose is to consume the data given from the hash params provided from
 * where the user was navigated from. In the case of this component, the user
 * was navigated from Admin and the query params differ from what they would be
 * if the user was navgiated from Login. Further, we are doing no nonce checking here
 */

import axios from 'axios';
import React from 'react';
import { RouteComponentProps, useHistory, useLocation } from 'react-router-dom';
import Typography from 'src/components/core/Typography';
import TextField from 'src/components/TextField';
import PasswordInput from 'src/components/PasswordInput';
import Button from 'src/components/Button';
import Box from 'src/components/core/Box';
import { API_ROOT, APP_ROOT } from 'src/constants';
import GoogleIcon from 'src/assets/icons/providers/google-logo.svg';
import { makeStyles, Theme } from 'src/components/core/styles';
import classNames from 'classnames';
import Grid from 'src/components/Grid';
import Hidden from 'src/components/core/Hidden';
import Divider from 'src/components/core/Divider';
import { compose } from 'recompose';
import { withSnackbar, WithSnackbarProps } from 'notistack';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginBottom: theme.spacing(3),
    padding: theme.spacing(3),
    paddingTop: 17,
  },
  copy: {
    lineHeight: '1.25rem',
    marginTop: theme.spacing(),
    marginBottom: theme.spacing(2),
    maxWidth: 960,
  },
  providersList: {
    marginBottom: 0,
    width: 'calc(100% + 24px)',
    '& .MuiGrid-item': {
      [theme.breakpoints.down(1100)]: {
        flexBasis: '50%',
        maxWidth: '50%',
      },
      [theme.breakpoints.down('xs')]: {
        flexBasis: '100%',
        maxWidth: '100%',
      },
    },
    [theme.breakpoints.down('xs')]: {
      marginTop: theme.spacing(),
    },
  },
  button: {
    borderRadius: 1,
    backgroundColor: theme.name === 'lightTheme' ? '#f5f6f7' : '#444',
    marginTop: theme.spacing(),
    minHeight: 70,
    paddingRight: theme.spacing(3) - 4,
    paddingLeft: theme.spacing(3) - 4,
    width: 'calc(100% - 8px)',
    [theme.breakpoints.down('sm')]: {
      marginLeft: 0,
    },
    [theme.breakpoints.down('xs')]: {
      marginTop: 0,
      marginLeft: 0,
    },
    '&:hover': {
      backgroundColor: theme.color.grey6,
    },
    '& > span': {
      display: 'inline-block',
      color: theme.color.headline,
    },
  },
  providerIcon: {
    color: '#939598',
    height: 32,
    width: 32,
    marginRight: theme.spacing(2),
  },
  providerContent: {
    width: '100%',
  },
  isButtonEnabled: {
    border: `1px solid ${theme.palette.primary.main} !important`,
  },
  enabledText: {
    fontFamily: theme.font.normal,
    marginLeft: 4,
  },
  notice: {
    fontFamily: theme.font.bold,
    fontSize: '0.875rem',
  },
}));

type CombinedProps = RouteComponentProps & WithSnackbarProps;

const Login: React.FC<CombinedProps> = (props) => {
  const { enqueueSnackbar } = props;
  const classes = useStyles();
  const location = useLocation();
  const history = useHistory();

  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const params = new URLSearchParams(location.search);
      const res = await axios.post(
        `${API_ROOT}/auth-callback`,
        JSON.stringify({
          username,
          password,
        }),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      let url = new URL(`${APP_ROOT}/oauth/callback?returnTo=/`);
      const redirectUri = params.get('redirect_uri');
      if (redirectUri) {
        url = new URL(redirectUri);
      }
      url.searchParams.append('access_token', res.data.access_token);
      url.searchParams.append('expires_in', res.data.expires_in);
      url.searchParams.append('state', params.get('state') ?? '');
      url.hash = url.searchParams.toString();
      const keys: string[] = [];
      url.searchParams.forEach((_, key) => {
        keys.push(key);
      });
      keys.forEach((key) => url.searchParams.delete(key));
      history.replace(`${url.pathname}${url.hash}`);
    } catch (err) {
      enqueueSnackbar('Failed to login', { variant: 'error' });
    }
  };

  const handleLoginWithGoogle = async () => {
    try {
      const res = await axios.get(`${API_ROOT}/oauthclient${location.search}`);
      window.location.replace(res.data.authUrl);
    } catch (err) {
      enqueueSnackbar('Failed to login with Google', { variant: 'error' });
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
      }}
    >
      <div>
        <div style={{ marginBottom: 30 }}>
          <Typography align="center" variant="h1">
            Welcome to Clanode!
          </Typography>
        </div>
        <Grid container>
          <Grid item xs={12} sm={5}>
            <Button
              className={classNames({
                [classes.button]: true,
              })}
              onClick={handleLoginWithGoogle}
            >
              <GoogleIcon className={classes.providerIcon} />
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                className={classes.providerContent}
              >
                <div>Log in with Google</div>
              </Box>
            </Button>
          </Grid>
          <Hidden xsDown>
            <Grid
              item
              sm={2}
              style={{
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <Divider orientation="vertical" variant="middle" />
            </Grid>
          </Hidden>
          <Grid item xs={12} sm={5}>
            <Typography align="center" variant="h3">
              Log in with username/password
            </Typography>
            <form onSubmit={handleLogin}>
              <TextField
                label="Username"
                //  errorText={errorMap.first_name}
                onChange={handleUsernameChange}
                //  value={defaultTo(account.first_name, fields.first_name)}
                // data-qa-contact-first-name
              />

              <PasswordInput
                label="Password"
                onChange={handlePasswordChange}
                hideStrengthLabel
                hideValidation
              />
              <Button
                type="submit"
                buttonType="primary"
                style={{ backgroundColor: '#00b159', marginTop: 10 }}
                onClick={handleLogin}
              >
                Log in
              </Button>
            </form>
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

const enhanced = compose<CombinedProps, {}>(
  withSnackbar
)(Login);

export default enhanced;
