import { Profile, TPAProvider } from '@linode/api-v4/lib/profile';
import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { compose } from 'recompose';
import { makeStyles } from 'src/components/core/styles';
import setDocs from 'src/components/DocsSidebar/setDocs';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Notice from 'src/components/Notice';
import TabbedPanel from 'src/components/TabbedPanel';
import { AccountsAndPasswords, SecurityControls } from 'src/documentation';
import { updateProfile as _updateProfile } from 'src/store/profile/profile.requests';
import { MapState } from 'src/store/types';
import ResetPassword from './ResetPassword';
import SecuritySettings from './SecuritySettings';
import ThirdParty from './ThirdParty';
import ThirdPartyContent from './ThirdPartyContent';
import TrustedDevices from './TrustedDevices';
import TwoFactor from './TwoFactor';

const useStyles = makeStyles(() => ({
  inner: {
    paddingTop: 0,
  },
}));

export type CombinedProps = StateProps & DispatchProps;

export const AuthenticationSettings: React.FC<CombinedProps> = props => {
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

  const tabs = [
    {
      title: 'Linode Credentials',
      render: () => (
        <React.Fragment>
          {thirdPartyEnabled && <ThirdParty authType={authType} />}
          <ResetPassword username={username} disabled={thirdPartyEnabled} />
          <TwoFactor
            twoFactor={twoFactor}
            username={username}
            clearState={clearState}
            updateProfile={updateProfile}
            disabled={thirdPartyEnabled}
          />
          <TrustedDevices disabled={thirdPartyEnabled} />
          {ipAllowlisting && (
            <SecuritySettings
              updateProfile={updateProfile}
              onSuccess={onAllowlistingDisable}
              updateProfileError={props.profileUpdateError}
              ipAllowlistingEnabled={ipAllowlisting}
              data-qa-allowlisting-form
            />
          )}
        </React.Fragment>
      ),
    },
  ];

  tabs.push({
    title: 'Third-Party Authentication',
    render: () => <ThirdPartyContent authType={authType} />,
  });

  const initialTab = 0;

  return (
    <div data-testid="authSettings">
      <DocumentTitleSegment segment={`Password & Authentication`} />
      {/* Remove when logic above is cleared */}
      {success && <Notice success text={success} />}
      {!loading && (
        <TabbedPanel
          rootClass={`tabbedPanel`}
          innerClass={`${classes.inner}`}
          header={''}
          tabs={tabs}
          initTab={initialTab}
        />
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

const mapStateToProps: MapState<StateProps, {}> = state => {
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

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = dispatch => ({
  updateProfile: (v: Partial<Profile>) => dispatch(_updateProfile(v) as any),
});

const connected = connect(mapStateToProps, mapDispatchToProps);

const enhanced = compose<CombinedProps, {}>(connected, setDocs(docs));

export default enhanced(AuthenticationSettings);
