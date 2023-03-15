import * as React from 'react';
import CircleProgress from 'src/components/CircleProgress';
import Divider from 'src/components/core/Divider';
import Paper from 'src/components/core/Paper';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import Typography from 'src/components/core/Typography';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import ErrorState from 'src/components/ErrorState';
import { useProfile } from 'src/queries/profile';
import { PhoneVerification } from './PhoneVerification/PhoneVerification';
import ResetPassword from './ResetPassword';
import { SMSMessaging } from './SMSMessaging';
import TPAProviders from './TPAProviders';
import TrustedDevices from './TrustedDevices';
import TwoFactor from './TwoFactor';
import SecurityQuestions from './SecurityQuestions';
import Link from 'src/components/Link';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginBottom: theme.spacing(3),
    padding: theme.spacing(3),
    paddingTop: 17,
  },
  linode: {
    marginBottom: theme.spacing(2),
  },
  copy: {
    maxWidth: 960,
    lineHeight: '20px',
    marginTop: theme.spacing(),
  },
}));

export const AuthenticationSettings: React.FC = () => {
  const classes = useStyles();

  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
  } = useProfile();

  const authType = profile?.authentication_type ?? 'password';
  const twoFactor = Boolean(profile?.two_factor_auth);
  const username = profile?.username;

  const isThirdPartyAuthEnabled = authType !== 'password';

  if (profileError) {
    return <ErrorState errorText="Unable to load your profile" />;
  }

  if (profileLoading) {
    return <CircleProgress />;
  }

  return (
    <>
      <DocumentTitleSegment segment="Login & Authentication" />
      <TPAProviders authType={authType} />
      <Paper className={classes.root}>
        <Typography className={classes.linode} variant="h3">
          Security Settings
        </Typography>
        <Divider spacingTop={24} spacingBottom={16} />
        {!isThirdPartyAuthEnabled ? (
          <>
            <ResetPassword username={username} />
            <Divider spacingTop={22} spacingBottom={16} />
            <TwoFactor twoFactor={twoFactor} username={username} />
            <Divider spacingTop={22} spacingBottom={16} />
          </>
        ) : null}
        <SecurityQuestions />
        <Divider spacingTop={22} spacingBottom={16} />
        <Typography variant="h3">Phone Verification</Typography>
        <Typography variant="body1" className={classes.copy}>
          A verified phone number provides our team with a secure method of
          verifying your identity as the owner of your Linode user account. This
          phone number is only ever used to send an SMS message with a
          verification code. Standard carrier messaging fees may apply. By
          clicking Send Verification Code you are opting in to receive SMS
          messages. You may opt out at any time.{' '}
          <Link to="https://www.linode.com/docs/guides/user-security-controls#phone-verification">
            Learn more about security options.
          </Link>
        </Typography>
        <PhoneVerification />
        <Divider spacingTop={22} spacingBottom={16} />
        <Typography variant="h3">SMS Messaging</Typography>
        <SMSMessaging />
        {!isThirdPartyAuthEnabled ? (
          <>
            <Divider spacingTop={22} spacingBottom={16} />
            <TrustedDevices />
          </>
        ) : null}
      </Paper>
    </>
  );
};

export default AuthenticationSettings;
