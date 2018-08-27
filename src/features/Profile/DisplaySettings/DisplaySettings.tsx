import { compose } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';

import setDocs from 'src/components/DocsSidebar/setDocs';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';

import { response } from 'src/store/reducers/resources';

import EmailChangeForm from './EmailChangeForm';
import TimezoneForm from './TimezoneForm';

type ClassNames = 'root' | 'title';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {
    padding: theme.spacing.unit * 3,
    paddingBottom: theme.spacing.unit * 3,
  },
  title: {
    marginBottom: theme.spacing.unit * 2,
  },
});

interface Props { }

interface ConnectedProps {
  loading: boolean;
  username: string;
  email: string;
  timezone: string;
  updateProfile: (v: Linode.Profile) => void;
}

interface State {

}

type CombinedProps = Props & ConnectedProps & WithStyles<ClassNames>;

export class DisplaySettings extends React.Component<CombinedProps, State> {
  state: State = {
    submitting: false,
    updatedEmail: this.props.email || '',
    errors: undefined,
    success: undefined,
  }

  render() {
    const { email, loading, timezone, updateProfile, username } = this.props;

    return (
      <React.Fragment>
        <DocumentTitleSegment segment="Display" />
        {!loading &&
          <React.Fragment>
            <EmailChangeForm
              email={email} 
              username={username}
              updateProfile={updateProfile}
              data-qa-email-change
            />
            <TimezoneForm
              timezone={timezone}
              updateProfile={updateProfile}
            />
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
    loading: false,
    username: data.username,
    email: data.email,
    timezone: data.timezone,
  };
};

const mapDispatchToProps = (dispatch: Dispatch<any>) => bindActionCreators(
  {
    updateProfile: (v: Linode.Profile) => response(['profile'], v),
  },
  dispatch,
);

const connected = connect(mapStateToProps, mapDispatchToProps);

const enhanced = compose(
  styled,
  connected,
  setDocs(DisplaySettings.docs),
);

export default enhanced(DisplaySettings);
