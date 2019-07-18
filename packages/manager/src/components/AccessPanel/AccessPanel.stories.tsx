import { storiesOf } from '@storybook/react';
import * as React from 'react';
import AccessPanel, { UserSSHKeyObject } from './AccessPanel';

class PasswordAccess extends React.Component<{}, { password: string }> {
  state = {
    password: ''
  };

  handlePasswordChange = (password: string) =>
    this.setState({ password: password || '' });

  render() {
    return (
      <AccessPanel
        password={this.state.password}
        handleChange={this.handlePasswordChange}
        requestKeys={() => null}
      />
    );
  }
}

class PasswordAndSSHAccess extends React.Component<
  {},
  { password: string; users: UserSSHKeyObject[] }
> {
  state = {
    password: '',
    users: [
      {
        gravatarUrl:
          'https://www.gravatar.com/avatar/00000000000000000000000000000000?s=24',
        username: 'Joe',
        selected: false,
        keys: [
          'some-key',
          'some-key',
          'some-key',
          'some-key',
          'some-key',
          'some-key',
          'some-key',
          'some-key',
          'some-key',
          'some-key',
          'some-key',
          'some-key',
          'some-key'
        ],
        onSSHKeyChange: (
          e: React.ChangeEvent<HTMLInputElement>,
          result: boolean
        ) => this.toggleSSHUserKeys('Joe', result)
      },
      {
        gravatarUrl:
          'https://www.gravatar.com/avatar/00000000000000000000000000000000?s=24',
        username: 'Bob',
        selected: false,
        keys: ['some-key'],
        onSSHKeyChange: (
          e: React.ChangeEvent<HTMLInputElement>,
          result: boolean
        ) => this.toggleSSHUserKeys('Bob', result)
      },
      {
        gravatarUrl:
          'https://www.gravatar.com/avatar/00000000000000000000000000000000?s=24',
        username: 'Mark',
        selected: false,
        keys: ['some-key', 'some-key'],
        onSSHKeyChange: (
          e: React.ChangeEvent<HTMLInputElement>,
          result: boolean
        ) => this.toggleSSHUserKeys('Mark', result)
      }
    ]
  };

  toggleSSHUserKeys = (username: string, result: boolean) =>
    this.setState(state => ({
      ...state,
      users: state.users.map(user =>
        username === user.username ? { ...user, selected: result } : user
      )
    }));

  handlePasswordChange = (password: string) =>
    this.setState({ password: password || '' });

  render() {
    return (
      <AccessPanel
        password={this.state.password}
        handleChange={this.handlePasswordChange}
        users={this.state.users}
        requestKeys={() => null}
      />
    );
  }
}

storiesOf('Access Panel', module)
  .add('Password Access', () => <PasswordAccess />)
  .add('Password and SSH Key Access', () => <PasswordAndSSHAccess />);
