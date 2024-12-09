import { createUser } from '@linode/api-v4/lib/account';
import { FormControlLabel, Notice, TextField, Toggle } from '@linode/ui';
import * as React from 'react';
import { withRouter } from 'react-router-dom';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Drawer } from 'src/components/Drawer';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { getAPIErrorFor } from 'src/utilities/getAPIErrorFor';

import type { User } from '@linode/api-v4/lib/account';
import type { APIError } from '@linode/api-v4/lib/types';
import type { RouteComponentProps } from 'react-router-dom';

interface Props {
  onClose: () => void;
  open: boolean;
  refetch: () => void;
}

interface State {
  email: string;
  errors: APIError[];
  restricted: boolean;
  submitting: boolean;
  username: string;
}

interface CreateUserDrawerProps extends Props, RouteComponentProps<{}> {}

class CreateUserDrawer extends React.Component<CreateUserDrawerProps, State> {
  handleChangeEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      email: e.target.value,
    });
  };

  handleChangeRestricted = () => {
    this.setState({
      restricted: !this.state.restricted,
    });
  };

  handleChangeUsername = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    this.setState({
      username: e.target.value,
    });
  };

  onSubmit = () => {
    const {
      history: { push },
      onClose,
      refetch,
    } = this.props;
    const { email, restricted, username } = this.state;
    this.setState({ errors: [], submitting: true });
    createUser({ email, restricted, username })
      .then((user: User) => {
        this.setState({ submitting: false });
        onClose();
        if (user.restricted) {
          push(`/account/users/${username}/permissions`, {
            newUsername: user.username,
          });
        }
        refetch();
      })
      .catch((errResponse) => {
        const errors = getAPIErrorOrDefault(
          errResponse,
          'Error creating user.'
        );
        this.setState({ errors, submitting: false });
      });
  };

  state: State = {
    email: '',
    errors: [],
    restricted: false,
    submitting: false,
    username: '',
  };

  componentDidUpdate(prevProps: CreateUserDrawerProps) {
    if (this.props.open === true && prevProps.open === false) {
      this.setState({
        email: '',
        errors: [],
        restricted: false,
        submitting: false,
        username: '',
      });
    }
  }

  render() {
    const { onClose, open } = this.props;
    const { email, errors, restricted, submitting, username } = this.state;

    const hasErrorFor = getAPIErrorFor(
      { email: 'Email', username: 'Username' },
      errors
    );
    const generalError = hasErrorFor('none');

    return (
      <Drawer onClose={onClose} open={open} title="Add a User">
        {generalError && <Notice text={generalError} variant="error" />}
        <TextField
          data-qa-create-username
          errorText={hasErrorFor('username')}
          label="Username"
          onBlur={this.handleChangeUsername}
          onChange={this.handleChangeUsername}
          required
          trimmed
          value={username}
        />
        <TextField
          data-qa-create-email
          errorText={hasErrorFor('email')}
          label="Email"
          onChange={this.handleChangeEmail}
          required
          trimmed
          type="email"
          value={email}
        />
        <FormControlLabel
          control={
            <Toggle
              checked={!restricted}
              data-qa-create-restricted
              onChange={this.handleChangeRestricted}
            />
          }
          label={
            restricted
              ? `This user will have limited access to account features.
              This can be changed later.`
              : `This user will have full access to account features.
              This can be changed later.`
          }
          style={{ marginTop: 8 }}
        />
        <div style={{ marginTop: 8 }}>
          <Notice
            text="The user will be sent an email to set their password"
            variant="warning"
          />
        </div>
        <ActionsPanel
          primaryButtonProps={{
            'data-testid': 'submit',
            label: 'Add User',
            loading: submitting,
            onClick: this.onSubmit,
          }}
          secondaryButtonProps={{
            'data-testid': 'cancel',
            label: 'Cancel',
            onClick: onClose,
          }}
        />
      </Drawer>
    );
  }
}

export default withRouter(CreateUserDrawer);
