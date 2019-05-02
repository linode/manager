import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import FormControlLabel from 'src/components/core/FormControlLabel';
import {
  StyleRulesCallback,
  WithStyles,
  withStyles
} from 'src/components/core/styles';
import Drawer from 'src/components/Drawer';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';
import Toggle from 'src/components/Toggle';
import { createUser } from 'src/services/account';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {}
});

interface Props {
  open: boolean;
  onClose: () => void;
  addUser: (user: Linode.User) => void;
}

interface State {
  username: string;
  email: string;
  restricted: boolean;
  errors: Linode.ApiFieldError[];
  submitting: boolean;
}

type CombinedProps = Props & WithStyles<ClassNames> & RouteComponentProps<{}>;

class CreateUserDrawer extends React.Component<CombinedProps, State> {
  state: State = {
    username: '',
    email: '',
    restricted: false,
    errors: [],
    submitting: false
  };

  componentDidUpdate(prevProps: CombinedProps) {
    if (this.props.open === true && prevProps.open === false) {
      this.setState({
        username: '',
        email: '',
        restricted: false,
        errors: [],
        submitting: false
      });
    }
  }

  onSubmit = () => {
    const {
      addUser,
      onClose,
      history: { push }
    } = this.props;
    const { username, email, restricted } = this.state;
    this.setState({ errors: [], submitting: true });
    createUser({ username, email, restricted })
      .then((user: Linode.User) => {
        this.setState({ submitting: false });
        onClose();
        if (!user.restricted) {
          addUser(user);
        } else {
          push(`/account/users/${username}/permissions`, {
            newUsername: user.username
          });
        }
      })
      .catch(errResponse => {
        const errors = getAPIErrorOrDefault(
          errResponse,
          'Error creating user.'
        );
        this.setState({ errors, submitting: false });
      });
  };

  onChangeUsername = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      username: e.target.value
    });
  };

  onChangeEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      email: e.target.value
    });
  };

  onChangeRestricted = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      restricted: !this.state.restricted
    });
  };

  render() {
    const { open, onClose } = this.props;
    const { username, email, restricted, errors, submitting } = this.state;

    const hasErrorFor = getAPIErrorsFor(
      { username: 'Username', email: 'Email' },
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
          <Button
            type="primary"
            onClick={this.onSubmit}
            loading={submitting}
            data-qa-submit
          >
            Submit
          </Button>
          <Button type="cancel" onClick={onClose} data-qa-cancel>
            Cancel
          </Button>
        </ActionsPanel>
      </Drawer>
    );
  }
}

const styled = withStyles(styles);

export default styled(withRouter(CreateUserDrawer));
