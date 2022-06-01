import * as React from 'react';
import CircleProgress from 'src/components/CircleProgress';
import Divider from 'src/components/core/Divider';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import ErrorState from 'src/components/ErrorState';
import Notice from 'src/components/Notice';
import { useMutateProfile, useProfile } from 'src/queries/profile';
import ResetPassword from './ResetPassword';
import SecuritySettings from './SecuritySettings';
import { SMSMessageing } from './SMSMessaging';
import TPAProviders from './TPAProviders';
import TrustedDevices from './TrustedDevices';
import TwoFactor from './TwoFactor';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginBottom: theme.spacing(3),
    padding: theme.spacing(3),
    paddingTop: 17,
  },
  linode: {
    marginBottom: theme.spacing(2),
  },
}));

export const AuthenticationSettings: React.FC = () => {
  const classes = useStyles();

  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
  } = useProfile();

  const {
    mutateAsync: updateProfile,
    error: profileUpdateError,
  } = useMutateProfile();

  const authType = profile?.authentication_type ?? 'password';
  const ipAllowlisting = profile?.ip_whitelist_enabled ?? false;
  const twoFactor = Boolean(profile?.two_factor_auth);
  const username = profile?.username;

  const isThirdPartyAuthEnabled = authType !== 'password';

  const [success, setSuccess] = React.useState<string | undefined>(undefined);

  const clearState = () => {
    setSuccess(undefined);
  };

  const onAllowlistingDisable = () => {
    setSuccess('IP allowlisting disabled. This feature cannot be re-enabled.');
  };

  if (profileError) {
    return <ErrorState errorText="Unable to load your profile" />;
  }

  if (profileLoading) {
    return <CircleProgress />;
  }

  return (
    <div data-testid="authSettings">
      <DocumentTitleSegment segment="Login & Authentication" />
      {success && <Notice success text={success} />}
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
            <TwoFactor
              twoFactor={twoFactor}
              username={username}
              clearState={clearState}
            />
            <Divider spacingTop={22} spacingBottom={16} />
          </>
        ) : null}
        <Typography variant="h3">Security Questions</Typography>
        <Typography variant="body1" style={{ marginTop: 8, marginBottom: 8 }}>
          This is a placeholder for the Security Questions component.
        </Typography>
        <Divider spacingTop={22} spacingBottom={16} />
        <Typography variant="h3">Phone Verification</Typography>
        <Typography variant="body1" style={{ marginTop: 8, marginBottom: 8 }}>
          This is a placeholder for the Phone Verification component.
        </Typography>
        <Divider spacingTop={22} spacingBottom={16} />
        <Typography variant="h3">SMS Messaging</Typography>
        <SMSMessageing />
        {!isThirdPartyAuthEnabled ? (
          <>
            <Divider spacingTop={22} spacingBottom={16} />
            <TrustedDevices />
            {ipAllowlisting ? (
              <SecuritySettings
                updateProfile={updateProfile}
                onSuccess={onAllowlistingDisable}
                updateProfileError={profileUpdateError || undefined}
                ipAllowlistingEnabled={ipAllowlisting}
                data-qa-allowlisting-form
              />
            ) : null}
          </>
        ) : null}
      </Paper>
    </div>
  );
};

export default AuthenticationSettings;
