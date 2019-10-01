import { Profile } from 'linode-js-sdk/lib/profile';
import { APIError } from 'linode-js-sdk/lib/types';
import { lensPath, set } from 'ramda';
import * as React from 'react';
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

type CombinedProps = Props & WithStyles<ClassNames>;

export class EmailChangeForm extends React.Component<CombinedProps, State> {
  state: State = {
    updatedEmail: this.props.email || '',
    errors: this.props.errors,
    success: undefined,
    submitting: false
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
      <React.Fragment>
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
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles);

export default styled(EmailChangeForm);
