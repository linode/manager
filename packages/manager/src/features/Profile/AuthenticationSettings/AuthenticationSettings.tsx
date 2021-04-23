import { Profile, TPAProvider } from '@linode/api-v4/lib/profile';
import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { compose } from 'recompose';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import setDocs from 'src/components/DocsSidebar/setDocs';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Notice from 'src/components/Notice';
import { AccountsAndPasswords, SecurityControls } from 'src/documentation';
import { updateProfile as _updateProfile } from 'src/store/profile/profile.requests';
import { MapState } from 'src/store/types';
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

export type CombinedProps = StateProps & DispatchProps;

export const AuthenticationSettings: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();
  const {
    loading,
    authType,
    ipAllowlisting,
    twoFactor,
    username,
    updateProfile,
  } = props;

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
      <DocumentTitleSegment segment={`Login Security`} />
      {/* Remove when logic above is cleared */}
      {success && <Notice success text={success} />}
      {!loading && (
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
                updateProfile={updateProfile}
              />
              <TrustedDevices />
              {ipAllowlisting && (
                <SecuritySettings
                  updateProfile={updateProfile}
                  onSuccess={onAllowlistingDisable}
                  updateProfileError={props.profileUpdateError}
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

interface StateProps {
  loading: boolean;
  authType: TPAProvider;
  ipAllowlisting: boolean;
  twoFactor?: boolean;
  username?: string;
  profileUpdateError?: APIError[];
}

const mapStateToProps: MapState<StateProps, {}> = (state) => {
  const { profile } = state.__resources;

  return {
    loading: profile.loading,
    authType: profile?.data?.authentication_type ?? 'password',
    ipAllowlisting: profile?.data?.ip_whitelist_enabled ?? false,
    twoFactor: profile?.data?.two_factor_auth,
    username: profile?.data?.username,
    profileUpdateError: profile.error?.update,
  };
};

interface DispatchProps {
  updateProfile: (v: Partial<Profile>) => Promise<Profile>;
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (
  dispatch
) => ({
  updateProfile: (v: Partial<Profile>) => dispatch(_updateProfile(v) as any),
});

const connected = connect(mapStateToProps, mapDispatchToProps);

const enhanced = compose<CombinedProps, {}>(connected, setDocs(docs));

export default enhanced(AuthenticationSettings);
