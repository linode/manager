import { path, pathOr } from 'ramda';
import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { compose as recompose } from 'recompose';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import setDocs from 'src/components/DocsSidebar/setDocs';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { AccountsAndPasswords } from 'src/documentation';
import { ProfileWithPreferences } from 'src/store/profile/profile.actions';
import { updateProfile as handleUpdateProfile } from 'src/store/profile/profile.requests';
import { MapState } from 'src/store/types';
import EmailChangeForm from './EmailChangeForm';
import TimezoneForm from './TimezoneForm';

type ClassNames = 'root' | 'title';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(3),
      paddingBottom: theme.spacing(3)
    },
    title: {
      marginBottom: theme.spacing(2)
    }
  });

interface State {
  submitting: boolean;
  updatedEmail: string;
  errors?: any;
  success?: any;
}

type CombinedProps = StateProps & DispatchProps & WithStyles<ClassNames>;

export class DisplaySettings extends React.Component<CombinedProps, State> {
  state: State = {
    submitting: false,
    updatedEmail: this.props.email || '',
    errors: undefined,
    success: undefined
  };

  render() {
    const {
      email,
      updateProfile,
      loggedInAsCustomer,
      loading,
      timezone,
      username
    } = this.props;

    if (!email || !username) {
      return null;
    }

    return (
      <React.Fragment>
        <DocumentTitleSegment segment="Display" />
        {!loading && (
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
              loggedInAsCustomer={loggedInAsCustomer}
            />
          </React.Fragment>
        )}
      </React.Fragment>
    );
  }

  static docs = [AccountsAndPasswords];
}

const styled = withStyles(styles);

interface StateProps {
  loading: boolean;
  username?: string;
  email?: string;
  timezone: string;
  loggedInAsCustomer: boolean;
}

const mapStateToProps: MapState<StateProps, {}> = state => {
  const { profile } = state.__resources;
  return {
    loading: profile.loading,
    username: path(['data', 'username'], profile),
    email: path(['data', 'email'], profile),
    timezone: pathOr<string>('GMT', ['data', 'timezone'], profile),
    loggedInAsCustomer: pathOr(
      false,
      ['authentication', 'loggedInAsCustomer'],
      state
    )
  };
};

interface DispatchProps {
  updateProfile: (v: Linode.Profile) => Promise<ProfileWithPreferences>;
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = dispatch => ({
  updateProfile: (v: Linode.Profile) => dispatch(handleUpdateProfile(v) as any)
});

const connected = connect(
  mapStateToProps,
  mapDispatchToProps
);

const enhanced = recompose<CombinedProps, {}>(
  styled,
  connected,
  setDocs(DisplaySettings.docs)
);

export default enhanced(DisplaySettings);
