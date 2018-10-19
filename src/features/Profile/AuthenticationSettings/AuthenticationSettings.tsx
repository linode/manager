import { compose, lensPath, path, set } from 'ramda';
import * as React from 'react';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';

import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';

import setDocs from 'src/components/DocsSidebar/setDocs';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Notice from 'src/components/Notice';
import { AccountsAndPasswords, SecurityControls } from 'src/documentation';
import { handleUpdate } from 'src/store/reducers/resources/profile';

import SecuritySettings from './SecuritySettings';
import TwoFactor from './TwoFactor';

type ClassNames = 'root' | 'title';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {
    padding: theme.spacing.unit * 3,
    paddingBottom: theme.spacing.unit * 3,
    marginBottom: theme.spacing.unit * 3,
  },
  title: {
    marginBottom: theme.spacing.unit * 2,
  },
});

interface State {
  success?: string;
}

type CombinedProps = StateProps & DispatchProps & WithStyles<ClassNames>;

export class AuthenticationSettings extends React.Component<CombinedProps, State> {
  /*
  * @todo This logic can be removed when IP Whitelisting (legacy)
  * has been fully deprecated.
  */
  state: State = {
    success: undefined,
  }

  // See above
  clearState = () => {
    this.setState(set(lensPath(['success']), undefined));
  }

  // See above
  onWhitelistingDisable = () => {
    this.setState(set(lensPath(['success']), 'IP whitelisting disabled. This feature cannot be re-enabled.'));
  }

  render() {
    const { loading, ipWhitelisting, twoFactor, username, actions } = this.props;
    const { success } = this.state;

    return (
      <React.Fragment>
        <DocumentTitleSegment segment={`Password & Authentication`} />
        {/* Remove when logic above is cleared */}
        {success && <Notice success text={success} />}
        {!loading &&
          <React.Fragment>
            <TwoFactor
              twoFactor={twoFactor}
              username={username}
              clearState={this.clearState}
              updateProfile={actions.updateProfile}
            />
            {ipWhitelisting &&
              <SecuritySettings
                updateProfile={actions.updateProfile}
                onSuccess={this.onWhitelistingDisable}
                data-qa-whitelisting-form
              />
            }
          </React.Fragment>
        }
      </React.Fragment>
    );
  }

  static docs = [
    AccountsAndPasswords,
    SecurityControls,
  ];

}

const styled = withStyles(styles, { withTheme: true });

interface StateProps {
  loading: boolean;
  ipWhitelisting?: boolean;
  twoFactor?: boolean;
  username?: string;
}

const mapStateToProps: MapStateToProps<StateProps, {}, ApplicationState> = (state) => {
  const { profile } = state.__resources;

  return {
    loading: profile.loading,
    ipWhitelisting: path(['data', 'ip_whitelist_enabled'], profile),
    twoFactor: path(['data', 'two_factor_auth'], profile),
    username: path(['data', 'username'], profile),
  };
};

interface DispatchProps {
  actions: {
    updateProfile: (v: Partial<Linode.Profile>) => void;
  },
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch) => ({
  actions: {
    updateProfile: (v: Partial<Linode.Profile>) => dispatch(handleUpdate(v)),
  },
});

const connected = connect(mapStateToProps, mapDispatchToProps);

const enhanced = compose(
  styled,
  connected,
  setDocs(AuthenticationSettings.docs),
);

export default enhanced(AuthenticationSettings);
