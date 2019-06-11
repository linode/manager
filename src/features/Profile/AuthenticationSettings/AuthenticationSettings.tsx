import { WithStyles } from '@material-ui/core/styles';
import { lensPath, path, set } from 'ramda';
import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { compose } from 'recompose'
import { createStyles, Theme, withStyles } from 'src/components/core/styles';
import setDocs from 'src/components/DocsSidebar/setDocs';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Notice from 'src/components/Notice';
import { AccountsAndPasswords, SecurityControls } from 'src/documentation';
import { handleUpdate } from 'src/store/profile/profile.actions';
import { MapState } from 'src/store/types';
import ResetPassword from './ResetPassword';
import SecuritySettings from './SecuritySettings';
import TrustedDevices from './TrustedDevices';
import TwoFactor from './TwoFactor';

type ClassNames = 'root' | 'title';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(3),
      paddingBottom: theme.spacing(3),
      marginBottom: theme.spacing(3)
    },
    title: {
      marginBottom: theme.spacing(2)
    }
  });

interface State {
  success?: string;
}

type CombinedProps = StateProps & DispatchProps & WithStyles<ClassNames>;

export class AuthenticationSettings extends React.Component<
  CombinedProps,
  State
  > {
  /*
   * @todo This logic can be removed when IP Whitelisting (legacy)
   * has been fully deprecated.
   */
  state: State = {
    success: undefined
  };

  // See above
  clearState = () => {
    this.setState(set(lensPath(['success']), undefined));
  };

  // See above
  onWhitelistingDisable = () => {
    this.setState(
      set(
        lensPath(['success']),
        'IP whitelisting disabled. This feature cannot be re-enabled.'
      )
    );
  };

  render() {
    const {
      loading,
      ipWhitelisting,
      twoFactor,
      username,
      actions
    } = this.props;
    const { success } = this.state;

    return (
      <React.Fragment>
        <DocumentTitleSegment segment={`Password & Authentication`} />
        {/* Remove when logic above is cleared */}
        {success && <Notice success text={success} />}
        {!loading && (
          <React.Fragment>
            <ResetPassword />
            <TwoFactor
              twoFactor={twoFactor}
              username={username}
              clearState={this.clearState}
              updateProfile={actions.updateProfile}
            />
            <TrustedDevices />
            {ipWhitelisting && (
              <SecuritySettings
                updateProfile={actions.updateProfile}
                onSuccess={this.onWhitelistingDisable}
                data-qa-whitelisting-form
              />
            )}
          </React.Fragment>
        )}
      </React.Fragment>
    );
  }

  static docs = [AccountsAndPasswords, SecurityControls];
}

const styled = withStyles(styles);

interface StateProps {
  loading: boolean;
  ipWhitelisting?: boolean;
  twoFactor?: boolean;
  username?: string;
}

const mapStateToProps: MapState<StateProps, {}> = state => {
  const { profile } = state.__resources;

  return {
    loading: profile.loading,
    ipWhitelisting: path(['data', 'ip_whitelist_enabled'], profile),
    twoFactor: path(['data', 'two_factor_auth'], profile),
    username: path(['data', 'username'], profile)
  };
};

interface DispatchProps {
  actions: {
    updateProfile: (v: Partial<Linode.Profile>) => void;
  };
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = dispatch => ({
  actions: {
    updateProfile: (v: Partial<Linode.Profile>) => dispatch(handleUpdate(v))
  }
});

const connected = connect(
  mapStateToProps,
  mapDispatchToProps
);

const enhanced = compose<CombinedProps, {}>(
  styled,
  connected,
  setDocs(AuthenticationSettings.docs)
);

export default enhanced(AuthenticationSettings);
