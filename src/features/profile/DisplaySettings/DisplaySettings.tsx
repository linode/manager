import { compose, lensPath, pathOr, set } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import Paper from '@material-ui/core/Paper';
import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import setDocs from 'src/components/DocsSidebar/setDocs';
import Notice from 'src/components/Notice';
import { updateProfile } from 'src/services/profile';
import { response } from 'src/store/reducers/resources';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';

import EmailChangeForm from './EmailChangeForm';

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
  updateProfile: (v: Linode.Profile) => void;
}

interface State {
  submitting: boolean;
  updatedEmail: string;
  errors?: Linode.ApiFieldError[];
  success?: string;
}

type CombinedProps = Props & ConnectedProps & WithStyles<ClassNames>;

export class DisplaySettings extends React.Component<CombinedProps, State> {
  state: State = {
    submitting: false,
    updatedEmail: this.props.email || '',
    errors: undefined,
    success: undefined,
  }

  handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState(set(lensPath(['updatedEmail']), e.target.value))
  }

  onCancel = () => {
    this.setState({
      submitting: false,
      updatedEmail: this.props.email || '',
      errors: undefined,
      success: undefined,
    });
  }

  onSubmit = () => {
    const { updatedEmail } = this.state;
    this.setState({ errors: undefined, submitting: true });

    updateProfile({ email: updatedEmail, })
      .then((response) => {
        this.props.updateProfile(response);
        this.setState({
          submitting: false,
          success: 'Account information updated.',
        })
      })
      .catch((error) => {
        const fallbackError = [{ reason: 'An unexpected error has occured.' }];
        this.setState({
          submitting: false,
          errors: pathOr(fallbackError, ['response', 'data', 'errors'], error),
          success: undefined,
        }, () => {
          scrollErrorIntoView();
        })
      });
  };

  render() {
    const { classes, loading, username } = this.props;
    const { updatedEmail, success, errors, submitting } = this.state;
    const hasErrorFor = getAPIErrorFor({
      username: 'username',
      email: 'email',
    }, errors);
    const generalError = hasErrorFor('none');
    const emailError = hasErrorFor('email');
    return (
      <React.Fragment>
        <Paper className={classes.root}>
          <Typography
            variant="title"
            className={classes.title}
            data-qa-title
          >
            Email Address
          </Typography>
          {success && <Notice success text={success} />}
          {generalError && <Notice error text={generalError} />}
          {
            loading
              ? null
              : (
                <EmailChangeForm
                  email={updatedEmail}  
                  error={emailError}
                  username={username}
                  submitting={submitting}
                  handleChange={this.handleEmailChange}
                  onCancel={this.onCancel}
                  onSubmit={this.onSubmit}
                  data-qa-email-change
                />
                )
        }
        </Paper>
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
