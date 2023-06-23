import { createUser, User } from '@linode/api-v4/lib/account';
import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import FormControlLabel from 'src/components/core/FormControlLabel';
import Drawer from 'src/components/Drawer';
import { Notice } from 'src/components/Notice/Notice';
import TextField from 'src/components/TextField';
import { Toggle } from 'src/components/Toggle';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';

interface Props {
  open: boolean;
  onClose: () => void;
  refetch: () => void;
}

interface State {
  username: string;
  email: string;
  restricted: boolean;
  errors: APIError[];
  submitting: boolean;
}

type CombinedProps = Props & RouteComponentProps<{}>;

class CreateUserDrawer extends React.Component<CombinedProps, State> {
  state: State = {
    email: '',
    errors: [],
    restricted: false,
    submitting: false,
    username: '',
  };

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

  onChangeUsername = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      username: e.target.value,
    });
  };

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

  render() {
    const { onClose, open } = this.props;
    const { email, errors, restricted, submitting, username } = this.state;

    const hasErrorFor = getAPIErrorsFor(
      { email: 'Email', username: 'Username' },
      errors
    );
    const generalError = hasErrorFor('none');

    return (
      <Drawer open={open} onClose={onClose} title="Add a User">
        {generalError && <Notice error text={generalError} />}
        <TextField
          label="Username"
          value={username}
          required
          onChange={this.onChangeUsername}
          errorText={hasErrorFor('username')}
          data-qa-create-username
        />
        <TextField
          label="Email"
          type="email"
          value={email}
          required
          onChange={this.onChangeEmail}
          errorText={hasErrorFor('email')}
          data-qa-create-email
        />
        <FormControlLabel
          style={{ marginTop: 8 }}
          label={
            restricted
              ? `This user will have limited access to account features.
              This can be changed later.`
              : `This user will have full access to account features.
              This can be changed later.`
          }
          control={
            <Toggle
              checked={!restricted}
              onChange={this.onChangeRestricted}
              data-qa-create-restricted
            />
          }
        />
        <div style={{ marginTop: 8 }}>
          <Notice
            warning
            text="The user will be sent an email to set their password"
          />
        </div>
        <ActionsPanel>
          <Button buttonType="secondary" onClick={onClose} data-qa-cancel>
            Cancel
          </Button>
          <Button
            buttonType="primary"
            onClick={this.onSubmit}
            loading={submitting}
            data-qa-submit
          >
            Add User
          </Button>
        </ActionsPanel>
      </Drawer>
    );
  }
}

export default withRouter(CreateUserDrawer);
