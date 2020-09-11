import { Profile } from '@linode/api-v4/lib/profile';
import { APIError } from '@linode/api-v4/lib/types';
import { lensPath, set } from 'ramda';
import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Paper from 'src/components/core/Paper';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';
import withNotifications, {
  WithNotifications
} from 'src/store/notification/notification.containers';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';

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

interface Props {
  username: string;
  email: string;
  updateProfile: (v: Partial<Profile>) => Promise<Profile>;
  errors?: APIError[];
}

interface State {
  errors?: APIError[];
  success?: string;
  submitting: boolean;
  updatedEmail: string;
}

type CombinedProps = Props &
  WithStyles<ClassNames> &
  RouteComponentProps &
  WithNotifications;

export class EmailChangeForm extends React.Component<CombinedProps, State> {
  state: State = {
    updatedEmail: this.props.email || '',
    errors: this.props.errors,
    success: undefined,
    submitting: false
  };

  emailRef = React.createRef<HTMLInputElement>();

  // Focus on Email field if coming from a "user_email_bounce" notification.
  // cDM handles the case where the user is coming from a different page.
  componentDidMount = () => {
    if (this.props.location.state?.focusEmail && this.emailRef.current) {
      this.emailRef.current.focus();
    }
  };

  // Focus on Email field if coming from a "user_email_bounce" notification.
  // cDU handles the case where the user is already on this page when
  // interacting with the notification.
  componentDidUpdate = (prevProps: CombinedProps) => {
    if (
      !prevProps.location.state?.focusEmail &&
      this.props.location.state?.focusEmail &&
      this.emailRef.current
    ) {
      this.emailRef.current.focus();
    }
  };

  handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState(set(lensPath(['updatedEmail']), e.target.value));
  };

  onCancel = () => {
    this.setState({
      submitting: false,
      updatedEmail: this.props.email || '',
      errors: undefined,
      success: undefined
    });
  };

  onSubmit = () => {
    const { updatedEmail } = this.state;
    this.setState({ errors: undefined, submitting: true });

    this.props
      .updateProfile({ email: updatedEmail })
      .then(() => {
        // If there's a "user_email_bounce" notification for this user, and
        // the user has just updated their email, re-request notifications to
        // potentially clear the email bounce notification.
        const hasUserEmailBounceNotification = this.props.notifications.find(
          thisNotification => thisNotification.type === 'user_email_bounce'
        );
        if (hasUserEmailBounceNotification) {
          this.props.requestNotifications();
        }

        this.setState({
          submitting: false,
          success: 'Email address updated.',
          errors: undefined
        });
      })
      .catch(error => {
        this.setState(
          {
            submitting: false,
            errors: getAPIErrorOrDefault(
              error,
              'Error updating email address.'
            ),
            success: undefined
          },
          () => {
            scrollErrorIntoView();
          }
        );
      });
  };

  render() {
    const { classes, username } = this.props;
    const { errors, success, submitting, updatedEmail } = this.state;
    const hasErrorFor = getAPIErrorFor(
      {
        email: 'email'
      },
      errors
    );
    const emailError = hasErrorFor('email');
    const generalError = hasErrorFor('none');

    return (
      <Paper className={classes.root}>
        {success && <Notice success text={success} />}
        {generalError && <Notice error text={generalError} />}
        <TextField
          disabled
          label="Username"
          value={username}
          errorGroup="display-settings-email"
          data-qa-username
        />
        <TextField
          inputRef={this.emailRef}
          label="Email"
          type="email"
          value={updatedEmail}
          onChange={this.handleEmailChange}
          errorText={emailError}
          errorGroup="display-settings-email"
          data-qa-email
        />
        <ActionsPanel>
          <Button
            buttonType="primary"
            onClick={this.onSubmit}
            loading={submitting}
            data-qa-submit
          >
            Save
          </Button>
          <Button buttonType="cancel" onClick={this.onCancel} data-qa-cancel>
            Cancel
          </Button>
        </ActionsPanel>
      </Paper>
    );
  }
}

const enhanced = compose<CombinedProps, Props>(
  withStyles(styles),
  withRouter,
  withNotifications()
);

export default enhanced(EmailChangeForm);
