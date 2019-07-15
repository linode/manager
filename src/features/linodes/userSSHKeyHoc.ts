import { assoc, clone, map, path } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import { UserSSHKeyObject } from 'src/components/AccessPanel';
import { getUsers } from 'src/services/account';
import { MapState } from 'src/store/types';
import { getEmailHash } from 'src/utilities/gravatar';

export interface UserSSHKeyProps {
  userSSHKeys: UserSSHKeyObject[];
  requestKeys: () => void;
}

export interface State {
  userSSHKeys: UserSSHKeyObject[];
  resetSSHKeys: () => void;
  requestKeys: () => void;
}

const resetKeys = (key: UserSSHKeyObject) => {
  return assoc('selected', false, key);
};

export default (Component: React.ComponentType<any>) => {
  class WrappedComponent extends React.PureComponent<StateProps, State> {
    resetSSHKeys = () => {
      const { userSSHKeys } = this.state;
      const newKeys = map(resetKeys, userSSHKeys);
      this.setState({ userSSHKeys: newKeys });
    };

    requestKeys = () => {
      const { username, userEmailAddress } = this.props;
      const { userSSHKeys } = this.state;
      /**
       * We need a copy of the keys to track what was selected before requesting keys.
       * This will be an empty array on the initial request.
       */
      const oldKeys = clone(userSSHKeys);
      if (!username || !userEmailAddress) {
        return;
      }

      getUsers()
        .then(response => {
          const users = response.data;
          if (!this.mounted || !users || users.length === 0) {
            return;
          }

          this.setState({
            userSSHKeys: [
              ...users.reduce((cleanedUsers, user) => {
                const keys = user.ssh_keys;
                const isSelected = this.isUserSelected(user.username, oldKeys);

                return [
                  ...cleanedUsers,
                  this.createUserObject(
                    user.username,
                    user.email,
                    keys,
                    isSelected
                  )
                ];
              }, [])
            ]
          });
        })
        .catch(() => {
          /* We don't need to do anything here, we just don't add the keys. */
        });
    };

    state: State = {
      userSSHKeys: [],
      resetSSHKeys: this.resetSSHKeys,
      requestKeys: this.requestKeys
    };

    mounted: boolean = false;

    componentWillUnmount() {
      this.mounted = false;
    }

    componentDidMount() {
      this.mounted = true;
      this.requestKeys();
    }

    render() {
      return React.createElement(Component, {
        ...this.props,
        ...this.state
      });
    }

    toggleSSHUserKeys = (username: string, result: boolean) =>
      this.setState(state => ({
        ...state,
        userSSHKeys: state.userSSHKeys.map(user =>
          username === user.username ? { ...user, selected: result } : user
        )
      }));

    createUserObject = (
      username: string,
      email: string,
      keys: string[],
      selected: boolean = false
    ) => ({
      keys,
      username,
      gravatarUrl: `https://www.gravatar.com/avatar/${getEmailHash(
        email
      )}?d=mp&s=24`,
      selected,
      onSSHKeyChange: (_: any, result: boolean) =>
        this.toggleSSHUserKeys(username, result)
    });

    isUserSelected = (username: string, keys: UserSSHKeyObject[]) => {
      const currentUserKeys = keys.find(
        thisKey => thisKey.username === username
      );
      return currentUserKeys ? currentUserKeys.selected : false;
    };
  }

  return connected(WrappedComponent);
};

interface StateProps {
  username?: string;
  userEmailAddress?: string;
}

const mapStateToProps: MapState<StateProps, {}> = state => ({
  username: path<string>(['data', 'username'], state.__resources.profile),
  userEmailAddress: path<string>(['data', 'email'], state.__resources.profile)
});
const connected = connect(mapStateToProps);
