import { Profile } from 'linode-js-sdk/lib/profile';
import { APIError } from 'linode-js-sdk/lib/types';
import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { compose } from 'recompose';
import Button from 'src/components/Button';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import setDocs from 'src/components/DocsSidebar/setDocs';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Notice from 'src/components/Notice';
import TabbedPanel from 'src/components/TabbedPanel';
import { AccountsAndPasswords, SecurityControls } from 'src/documentation';
import { updateProfile as _updateProfile } from 'src/store/profile/profile.requests';
import { MapState } from 'src/store/types';
import ResetPassword from './ResetPassword';
import SecuritySettings from './SecuritySettings';
import ThirdPartyAuthentication from './ThirdPartyAuthentication';
import TrustedDevices from './TrustedDevices';
import TwoFactor from './TwoFactor';

const useStyles = makeStyles((theme: Theme) => ({
  inner: {
    paddingTop: 0
  },
  copy: {
    lineHeight: 1.43,
    marginBottom: theme.spacing(3)
  }
}));

// interface Props {
//   disabled?: boolean;
// }

type CombinedProps = StateProps & DispatchProps;

export const AuthenticationSettings: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  const [success, setSuccess] = React.useState<string | undefined>('');
  const [thirdPartyAuthEnabled] = React.useState<boolean>(true);

  const { loading, ipWhitelisting, twoFactor, username, updateProfile } = props;

  const clearState = () => {
    setSuccess(undefined);
  };
  const onWhitelistingDisable = () => {
    setSuccess('IP whitelisting disabled. This feature cannot be re-enabled.');
  };

  // const toggleThirdPartyAuth = () => {
  //   if (thirdPartyAuthEnabled) {
  //     disabled = true;
  //   }
  // };

  const tabs = [
    {
      title: 'Linode Credentials',
      render: () => (
        <React.Fragment>
          <ThirdPartyAuthentication
            provider={'Github'}
            thirdPartyAuthEnabled={thirdPartyAuthEnabled}
          />
          <ResetPassword username={username} disabled={thirdPartyAuthEnabled} />
          <TwoFactor
            twoFactor={twoFactor}
            username={username}
            clearState={clearState}
            updateProfile={updateProfile}
            disabled={thirdPartyAuthEnabled}
          />
          <TrustedDevices disabled={thirdPartyAuthEnabled} />
          {ipWhitelisting && (
            <SecuritySettings
              updateProfile={updateProfile}
              onSuccess={onWhitelistingDisable}
              updateProfileError={props.profileUpdateError}
              ipWhitelistingEnabled={ipWhitelisting}
            />
          )}
        </React.Fragment>
      )
    },
    {
      title: 'Third-Party Authentication',
      render: () => (
        <React.Fragment>
          <Typography className={classes.copy}>
            Third-Party Authentication (TPA) allows you to log in to your Linode
            account using another provider. All aspects of logging in, such as
            passwords and Two-Factor Authentication (TFA), are managed through
            this provider.
          </Typography>
          <Typography className={classes.copy}>
            Select a provider below to go to their web site and set up access.
            You may only use one provider at a time.
          </Typography>
          <Button buttonType="primary">Github</Button>
        </React.Fragment>
      )
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
  thirdPartyAuth: boolean;
  ipWhitelisting: boolean;
  twoFactor?: boolean;
  username?: string;
  profileUpdateError?: APIError[];
}

const mapStateToProps: MapState<StateProps, {}> = state => {
  const { profile } = state.__resources;

  return {
    loading: profile.loading,
    thirdPartyAuth: false,
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
