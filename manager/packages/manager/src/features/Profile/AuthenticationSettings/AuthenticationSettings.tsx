import * as React from 'react';
import { compose } from 'recompose';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import setDocs from 'src/components/DocsSidebar/setDocs';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Notice from 'src/components/Notice';
import { AccountsAndPasswords, SecurityControls } from 'src/documentation';
import { useMutateProfile, useProfile } from 'src/queries/profile';
import ResetPassword from './ResetPassword';
import SecuritySettings from './SecuritySettings';
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

export const AuthenticationSettings: React.FC<{}> = () => {
  const classes = useStyles();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const {
    mutateAsync: updateProfile,
    error: profileUpdateError,
  } = useMutateProfile();

  const authType = profile?.authentication_type ?? 'password';
  const ipAllowlisting = profile?.ip_whitelist_enabled ?? false;
  const twoFactor = Boolean(profile?.two_factor_auth);
  const username = profile?.username;

  const [success, setSuccess] = React.useState<string | undefined>(undefined);

  const thirdPartyEnabled = authType !== 'password';

  const clearState = () => {
    setSuccess(undefined);
  };
  const onAllowlistingDisable = () => {
    setSuccess('IP allowlisting disabled. This feature cannot be re-enabled.');
  };

  return (
    <div data-testid="authSettings">
      <DocumentTitleSegment segment={`Login & Authentication`} />
      {/* Remove when logic above is cleared */}
      {success && <Notice success text={success} />}
      {!profileLoading && (
        <>
          <TPAProviders authType={authType} />

          {!thirdPartyEnabled && (
            <Paper className={classes.root}>
              <Typography className={classes.linode} variant="h3">
                Linode Authentication
              </Typography>
              <ResetPassword username={username} />
              <TwoFactor
                twoFactor={twoFactor}
                username={username}
                clearState={clearState}
              />
              <TrustedDevices />
              {ipAllowlisting && (
                <SecuritySettings
                  updateProfile={updateProfile}
                  onSuccess={onAllowlistingDisable}
                  updateProfileError={profileUpdateError || undefined}
                  ipAllowlistingEnabled={ipAllowlisting}
                  data-qa-allowlisting-form
                />
              )}
            </Paper>
          )}
        </>
      )}
    </div>
  );
};

const docs = [AccountsAndPasswords, SecurityControls];

const enhanced = compose(setDocs(docs));

export default enhanced(AuthenticationSettings);
