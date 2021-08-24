import { getUsers } from '@linode/api-v4/lib/account';
import { getSSHKeys, SSHKey } from '@linode/api-v4/lib/profile';
import { assoc, clone, equals, map } from 'ramda';
import * as React from 'react';
import { UserSSHKeyObject } from 'src/components/AccessPanel';
import { useProfile } from 'src/queries/profile';
import { getAll } from 'src/utilities/getAll';
import { getEmailHash } from 'src/utilities/gravatar';

export interface UserSSHKeyProps {
  userSSHKeys: UserSSHKeyObject[];
  requestKeys: () => void;
  sshError?: string;
}

export interface State {
  userSSHKeys: UserSSHKeyObject[];
  sshError?: string;
  resetSSHKeys: () => void;
  requestKeys: () => void;
}

const getAllSSHKeys = getAll<SSHKey>(getSSHKeys);

const resetKeys = (key: UserSSHKeyObject) => {
  return assoc('selected', false, key);
};

export default (Component: React.ComponentType<any>) => {
  return (props: any) => {
    const { data: profile } = useProfile();

    const username = profile?.username;
    const userEmailAddress = profile?.email;
    const isRestricted = profile?.restricted;

    const [userSSHKeys, setUserSSHKeys] = React.useState<UserSSHKeyObject[]>(
      []
    );
    const [sshError, setSshError] = React.useState<string | undefined>();

    const resetSSHKeys = () => {
      const newKeys = map(resetKeys, userSSHKeys);
      setUserSSHKeys(newKeys);
    };

    const requestKeys = () => {
      /**
       * We need a copy of the keys to track what was selected before requesting keys.
       * This will be an empty array on the initial request.
       */
      const oldKeys = clone(userSSHKeys);
      if (!username || !userEmailAddress) {
        return;
      }
      /**
       * Restricted users can't make GET requests to /users
       * (they can't even view themselves through this endpoint)
       * so the only way to get their keys is through /profile/ssh_keys.
       */

      if (isRestricted) {
        const isCurrentUserSelected = isUserSelected(username, oldKeys);
        getAllSSHKeys()
          .then((response) => {
            const keys = response.data;
            if (!keys || keys.length === 0) {
              return;
            }
            setSshError(undefined);
            setUserSSHKeys([
              createUserObject(
                username,
                userEmailAddress,
                keys.map((k) => k.label),
                isCurrentUserSelected
              ),
            ]);
          })
          .catch(() => {
            setSshError('Unable to load SSH keys');
          });
      } else {
        getUsers()
          .then((response) => {
            const users = response.data;
            if (!users || users.length === 0) {
              return;
            }
            setSshError(undefined);
            setUserSSHKeys([
              ...users.reduce((cleanedUsers, user) => {
                const keys = user.ssh_keys;
                const isSelected = isUserSelected(user.username, oldKeys, keys);

                return [
                  ...cleanedUsers,
                  createUserObject(user.username, user.email, keys, isSelected),
                ];
              }, []),
            ]);
          })
          .catch(() => {
            setSshError('Unable to load SSH keys');
          });
      }
    };

    const toggleSSHUserKeys = (username: string, result: boolean) =>
      setUserSSHKeys((prevUserSSHKeys) =>
        prevUserSSHKeys.map((user) =>
          username === user.username ? { ...user, selected: result } : user
        )
      );

    const createUserObject = (
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
        toggleSSHUserKeys(username, result),
    });

    const isUserSelected = (
      username: string,
      keys: UserSSHKeyObject[],
      newKeys?: string[]
    ) => {
      /**
       * In most cases, we're just seeing if the current user was selected before
       * the current update (since the update is coming from the API, which doesn't track
       * this). However, if we're requesting the keys again because a new key has just been
       * added, we want to select the user who added the key by default. In this case,
       * pass the new list of keys for the target user and see if it's different from the
       * previous list. If it's different, a user has added a key (deletions or updates don't
       * affect this HOC in any way).
       *
       * The above paragraph doesn't make much sense, and points to a deeper problem in how
       * we manage SSH key state. @todo #TDT replace this HOC.
       */
      const currentUserKeys = keys.find(
        (thisKey) => thisKey.username === username
      );
      return currentUserKeys
        ? currentUserKeys.selected || !equals(currentUserKeys.keys, newKeys)
        : false;
    };

    React.useEffect(() => {
      requestKeys();
    }, []);

    return React.createElement(Component, {
      ...props,
      userSSHKeys,
      sshError,
      resetSSHKeys,
      requestKeys,
    });
  };
};
