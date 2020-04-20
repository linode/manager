import { Profile } from 'linode-js-sdk/lib/profile';
import { APIError } from 'linode-js-sdk/lib/types';
import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { compose } from 'recompose';
import { makeStyles, Theme } from 'src/components/core/styles';
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

const useStyles = makeStyles((theme: Theme) => ({
  inner: {
    paddingTop: 0
  }
}));

type CombinedProps = StateProps & DispatchProps;

export const AuthenticationSettings: React.FC<CombinedProps> = props => {
  const classes = useStyles();
  const {
    loading,
    authType,
    ipWhitelisting,
    twoFactor,
    username,
    updateProfile
  } = props;

  const [success, setSuccess] = React.useState<string | undefined>(undefined);

  const thirdPartyEnabled = authType !== 'password';

  const clearState = () => {
    setSuccess(undefined);
  };
  const onWhitelistingDisable = () => {
    setSuccess('IP whitelisting disabled. This feature cannot be re-enabled.');
  };

  const tabs = [
    {
      title: 'Linode Credentials',
      render: () => (
        <React.Fragment>
          <ThirdParty authType={authType} />
          <ResetPassword username={username} disabled={thirdPartyEnabled} />
          <TwoFactor
            twoFactor={twoFactor}
            username={username}
            clearState={clearState}
            updateProfile={updateProfile}
            disabled={thirdPartyEnabled}
          />
          <TrustedDevices disabled={thirdPartyEnabled} />
          {ipWhitelisting && (
            <SecuritySettings
              updateProfile={updateProfile}
              onSuccess={onWhitelistingDisable}
              updateProfileError={props.profileUpdateError}
              ipWhitelistingEnabled={ipWhitelisting}
              data-qa-whitelisting-form
            />
          )}
        </React.Fragment>
      )
    },
    {
      title: 'Third-Party Authentication',
      render: () => <ThirdPartyContent authType={authType} />
    }
  ];

  const initialTab = 0;

  return (
    <div
      id="tabpanel-passwordAuthentication"
      role="tabpanel"
      aria-labelledby="tab-passwordAuthentication"
    >
      <DocumentTitleSegment segment={`Password & Authentication`} />
      {/* Remove when logic above is cleared */}
      {success && <Notice success text={success} />}
      {!loading && (
        <React.Fragment>
          <TabbedPanel
            rootClass={`tabbedPanel`}
            innerClass={`${classes.inner}`}
            header={''}
            tabs={tabs}
            initTab={initialTab}
          />
        </React.Fragment>
      )}
    </div>
  );
};

const docs = [AccountsAndPasswords, SecurityControls];

interface StateProps {
  loading: boolean;
  authType: string | undefined;
  ipWhitelisting: boolean;
  twoFactor?: boolean;
  username?: string;
  profileUpdateError?: APIError[];
}

const mapStateToProps: MapState<StateProps, {}> = state => {
  const { profile } = state.__resources;

  return {
    loading: profile.loading,
    authType: profile?.data?.authentication_type,
    ipWhitelisting: profile?.data?.ip_whitelist_enabled ?? false,
    twoFactor: profile?.data?.two_factor_auth,
    username: profile?.data?.username,
    profileUpdateError: profile.error?.update
  };
};

interface DispatchProps {
  updateProfile: (v: Partial<Profile>) => Promise<Profile>;
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = dispatch => ({
  updateProfile: (v: Partial<Profile>) => dispatch(_updateProfile(v) as any)
});

const connected = connect(mapStateToProps, mapDispatchToProps);

const enhanced = compose<CombinedProps, {}>(connected, setDocs(docs));

export default enhanced(AuthenticationSettings);
