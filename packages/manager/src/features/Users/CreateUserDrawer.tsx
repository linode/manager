import { User, createUser } from '@linode/api-v4/lib/account';
import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import ActionsPanel from 'src/components/ActionsPanel';
import { Button } from 'src/components/Button/Button';
import Drawer from 'src/components/Drawer';
import { Notice } from 'src/components/Notice/Notice';
import { TextField } from 'src/components/TextField';
import { Toggle } from 'src/components/Toggle';
import FormControlLabel from 'src/components/core/FormControlLabel';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';

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

type CombinedProps = Props & RouteComponentProps<{}>;

class CreateUserDrawer extends React.Component<CombinedProps, State> {
  componentDidUpdate(prevProps: CombinedProps) {
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

    const hasErrorFor = getAPIErrorsFor(
      { email: 'Email', username: 'Username' },
      errors
    );
    const generalError = hasErrorFor('none');

    return (
      <Drawer onClose={onClose} open={open} title="Add a User">
        {generalError && <Notice error text={generalError} />}
        <TextField
          data-qa-create-username
          errorText={hasErrorFor('username')}
          label="Username"
          onChange={this.onChangeUsername}
          required
          value={username}
        />
        <TextField
          data-qa-create-email
          errorText={hasErrorFor('email')}
          label="Email"
          onChange={this.onChangeEmail}
          required
          type="email"
          value={email}
        />
        <FormControlLabel
          control={
            <Toggle
              checked={!restricted}
              data-qa-create-restricted
              onChange={this.onChangeRestricted}
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
            warning
          />
        </div>
        <ActionsPanel>
          <Button buttonType="secondary" data-qa-cancel onClick={onClose}>
            Cancel
          </Button>
          <Button
            buttonType="primary"
            data-qa-submit
            loading={submitting}
            onClick={this.onSubmit}
          >
            Add User
          </Button>
        </ActionsPanel>
      </Drawer>
    );
  }

  onChangeEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      email: e.target.value,
    });
  };

  onChangeRestricted = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      restricted: !this.state.restricted,
    });
  };

  onChangeUsername = (e: React.ChangeEvent<HTMLInputElement>) => {
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
}

export default withRouter(CreateUserDrawer);
