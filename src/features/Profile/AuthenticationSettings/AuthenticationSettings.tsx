import { compose, lensPath, set, } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';

import setDocs from 'src/components/DocsSidebar/setDocs';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Notice from 'src/components/Notice';
import { response } from 'src/store/reducers/resources';

import SecuritySettings from './SecuritySettings';
import TwoFactor from './TwoFactor';

type ClassNames = 'root' | 'title';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {
    padding: theme.spacing.unit * 3,
    paddingBottom: theme.spacing.unit * 3,
    marginBottom: theme.spacing.unit * 3,
  },
  title: {
    marginBottom: theme.spacing.unit * 2,
  },
});

interface Props { }

interface ConnectedProps {
  loading: boolean;
  ipWhitelisting: boolean;
  twoFactor: boolean;
  username: string;
  updateProfile: (v: Partial<Linode.Profile>) => void;
}

interface State {
  success?: string;
}

type CombinedProps = Props & ConnectedProps & WithStyles<ClassNames>;

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
    this.setState(set(lensPath(['success']), undefined ));
  }

  // See above
  onWhitelistingDisable = () => {
    this.setState(set(lensPath(['success']), 'IP whitelisting disabled. This feature cannot be re-enabled.' ));
  }

  render() {
    const { loading, ipWhitelisting, twoFactor, username, updateProfile } = this.props;
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
              updateProfile={updateProfile}
            />
            {ipWhitelisting &&
              <SecuritySettings
                updateProfile={updateProfile}
                onSuccess={this.onWhitelistingDisable}
                data-qa-whitelisting-form
              />
            }
          </React.Fragment>
        }
      </React.Fragment>
    );
  }

  static docs = [{
    title: 'Accounts and Passwords',
    src: 'https://linode.com/docs/platform/accounts-and-passwords/',
    body: 'Maintaining your user accounts, passwords, and contact information is just as important as administering your Linode.'
  }];

}

const styled = withStyles(styles, { withTheme: true });

const mapStateToProps = (state: Linode.AppState) => {
  const { loading, data } = state.resources.profile!;

  if (loading) {
    return { loading: true }
  }

  return {
    ipWhitelisting: data.ip_whitelist_enabled,
    twoFactor: data.two_factor_auth,
    username: data.username,
  };
};

const mapDispatchToProps = (dispatch: Dispatch<any>) => bindActionCreators(
  {
    updateProfile: (v: Partial<Linode.Profile>) => response(['profile'], v),
  },
  dispatch,
);

const connected = connect(mapStateToProps, mapDispatchToProps);

const enhanced = compose(
  styled,
  connected,
  setDocs(AuthenticationSettings.docs),
);

export default enhanced(AuthenticationSettings);
