import { path } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import { UserSSHKeyObject } from 'src/components/AccessPanel';
import { getUsers } from 'src/services/account';
import { getSSHKeys } from 'src/services/profile';
import { getEmailHash } from 'src/utilities/gravatar';

interface Props {
  username: string;
  userEmailAddress: string;
}

interface State {
  userSSHKeys: UserSSHKeyObject[];
}

export default (Component: React.ComponentType<any>) => {
  class WrappedComponent extends React.PureComponent<Props, State> {
    state = {
      userSSHKeys: [],
    }

    mounted: boolean = false;

    componentWillUnmount() {
      this.mounted = false;
    }

    componentDidMount() {
      this.mounted = true;
      const { username, userEmailAddress } = this.props;
      if (!username || !userEmailAddress) { return; }

      getSSHKeys()
        .then((response) => {
          const keys = response.data
          if (!this.mounted || !keys || keys.length === 0) { return; }

          this.setState({
            userSSHKeys: [
              ...this.state.userSSHKeys,
              this.createUserObject(username, userEmailAddress, keys.map(k => k.label)),
            ],
          })
        })
        .catch(() => { /* We don't need to do anything here, we just don't add the keys. */});

      getUsers()
        .then((response) => {
          const users = response.data;
          if (!this.mounted || !users || users.length === 0) { return; }

          this.setState({
            userSSHKeys: [
              ...this.state.userSSHKeys,
              ...users.reduce((cleanedUsers, user) => {
                const keys = user.ssh_keys;
                if (
                  !keys || keys.length === 0 ||
                  /** We don't want the current user added again. */
                  user.username === this.props.username
                ) {
                  return cleanedUsers;
                }

                return [
                  ...cleanedUsers,
                  this.createUserObject(user.username, user.email, keys),
                ];
              }, [])
            ],
          })
        })
        .catch(() => { /* We don't need to do anything here, we just don't add the keys. */});
    }

    render() {
      return React.createElement(Component, {
        ...this.props,
        ...this.state,
      });
    }

    toggleSSHUserKeys = (username: string, result: boolean) => this.setState((state) => ({
      ...state,
      userSSHKeys: state.userSSHKeys.map((user) => (username === user.username) ? { ...user, selected: result } : user)
    }));

    createUserObject = (username: string, email: string, keys: string[]) => ({
      keys,
      username,
      gravatarUrl: `https://www.gravatar.com/avatar/${getEmailHash(email)}?d=mp&s=24`,
      selected: false,
      onChange: (_: any, result: boolean) => this.toggleSSHUserKeys(username, result),
    })
  }

  return connected<Props>(WrappedComponent);
}

const connected = connect((state: Linode.AppState) => ({
  username: path<string>(['data', 'username'], state.resources.profile),
  userEmailAddress: path<string>(['data', 'email'], state.resources.profile),
}))
