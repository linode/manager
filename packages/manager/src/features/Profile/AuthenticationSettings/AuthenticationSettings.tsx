import { Profile } from 'linode-js-sdk/lib/profile';
import { APIError } from 'linode-js-sdk/lib/types';
import { lensPath, path, pathOr, set } from 'ramda';
import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { compose } from 'recompose';
// import { makeStyles, Theme } from 'src/components/core/styles';
import setDocs from 'src/components/DocsSidebar/setDocs';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Notice from 'src/components/Notice';
// import TabbedPanel from 'src/components/TabbedPanel';
// import { Tab } from 'src/components/TabbedPanel/TabbedPanel';
import { AccountsAndPasswords, SecurityControls } from 'src/documentation';
import { updateProfile as _updateProfile } from 'src/store/profile/profile.requests';
import { MapState } from 'src/store/types';
import ResetPassword from './ResetPassword';
import SecuritySettings from './SecuritySettings';
import TrustedDevices from './TrustedDevices';
import TwoFactor from './TwoFactor';

// const useStyles = makeStyles((theme: Theme) => ({
//   root: {
//     padding: theme.spacing(3),
//     paddingBottom: theme.spacing(3),
//     marginBottom: theme.spacing(3)
//   },
//   title: {
//     marginBottom: theme.spacing(2)
//   }
// }));

type CombinedProps = StateProps & DispatchProps;

export const AuthenticationSettings: React.FC<CombinedProps> = props => {
  // const classes = useStyles();
  const [success, setSuccess] = React.useState<string>('');

  // See above
  const clearState = () => {
    setSuccess(set(lensPath(['success']), undefined));
  };

  // See above
  const onWhitelistingDisable = () => {
    setSuccess(
      set(
        lensPath(['success']),
        'IP whitelisting disabled. This feature cannot be re-enabled.'
      )
    );
  };

  const { loading, ipWhitelisting, twoFactor, username, updateProfile } = props;

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
          {/* <TabbedPanel>
            rootClass={`${classes.root} tabbedPanel`}
            error={error}
            copy={copy}
            tabs={tabs}
            initTab={initialTab}
          </TabbedPanel> */}
          <ResetPassword username={username} />
          <TwoFactor
            twoFactor={twoFactor}
            username={username}
            clearState={clearState}
            updateProfile={updateProfile}
          />
          <TrustedDevices />
          {ipWhitelisting && (
            <SecuritySettings
              updateProfile={updateProfile}
              onSuccess={onWhitelistingDisable}
              data-qa-whitelisting-form
              updateProfileError={props.profileUpdateError}
              ipWhitelistingEnabled={ipWhitelisting}
            />
          )}
        </React.Fragment>
      )}
    </div>
  );
};

const docs = [AccountsAndPasswords, SecurityControls];

interface StateProps {
  loading: boolean;
  ipWhitelisting: boolean;
  twoFactor?: boolean;
  username?: string;
  profileUpdateError?: APIError[];
}

const mapStateToProps: MapState<StateProps, {}> = state => {
  const { profile } = state.__resources;

  return {
    loading: profile.loading,
    ipWhitelisting: pathOr(false, ['data', 'ip_whitelist_enabled'], profile),
    twoFactor: path(['data', 'two_factor_auth'], profile),
    username: path(['data', 'username'], profile),
    profileUpdateError: path<APIError[]>(['update'], profile.error)
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
