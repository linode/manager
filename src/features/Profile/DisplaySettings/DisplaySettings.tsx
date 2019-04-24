import { compose, path, pathOr } from 'ramda';
import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import setDocs from 'src/components/DocsSidebar/setDocs';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { AccountsAndPasswords } from 'src/documentation';
import { handleUpdate } from 'src/store/profile/profile.actions';
import { MapState } from 'src/store/types';
import EmailChangeForm from './EmailChangeForm';
import TimezoneForm from './TimezoneForm';

type ClassNames = 'root' | 'title';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {
    padding: theme.spacing.unit * 3,
    paddingBottom: theme.spacing.unit * 3
  },
  title: {
    marginBottom: theme.spacing.unit * 2
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
      actions,
      email,
      isLoggedInAsCustomer,
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
              updateProfile={actions.updateProfile}
              data-qa-email-change
            />
            <TimezoneForm
              timezone={timezone}
              updateProfile={actions.updateProfile}
              isLoggedInAsCustomer={isLoggedInAsCustomer}
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
  isLoggedInAsCustomer: boolean;
}

const mapStateToProps: MapState<StateProps, {}> = state => {
  const { profile } = state.__resources;
  return {
    loading: profile.loading,
    username: path(['data', 'username'], profile),
    email: path(['data', 'email'], profile),
    timezone: defaultTimezone(profile),
    isLoggedInAsCustomer: pathOr(
      false,
      ['authentication', 'isLoggedInAsCustomer'],
      state
    )
  };
};

interface DispatchProps {
  actions: {
    updateProfile: (v: Linode.Profile) => void;
  };
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = dispatch => ({
  actions: {
    updateProfile: (v: Linode.Profile) => dispatch(handleUpdate(v))
  }
});

const defaultTimezone = compose(
  tz => (tz === '' ? 'GMT' : tz),
  pathOr('GMT', ['data', 'timezone'])
);

const connected = connect(
  mapStateToProps,
  mapDispatchToProps
);

const enhanced = compose(
  styled,
  connected,
  setDocs(DisplaySettings.docs)
);

export default enhanced(DisplaySettings);
