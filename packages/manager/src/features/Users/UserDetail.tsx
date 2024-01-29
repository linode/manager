import { getUser, updateUser } from '@linode/api-v4/lib/account';
import { updateProfile } from '@linode/api-v4/lib/profile';
import { APIError } from '@linode/api-v4/lib/types';
import { clone } from 'ramda';
import * as React from 'react';
import { useQueryClient } from 'react-query';
import {
  matchPath,
  useHistory,
  useLocation,
  useParams,
} from 'react-router-dom';

import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { LandingHeader } from 'src/components/LandingHeader';
import { Notice } from 'src/components/Notice/Notice';
import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { TabLinkList } from 'src/components/Tabs/TabLinkList';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import { queryKey } from 'src/queries/account';
import { useAccountUser } from 'src/queries/accountUsers';
import { useProfile } from 'src/queries/profile';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import UserPermissions from './UserPermissions';
import { UserProfile } from './UserProfile';

export const UserDetail = () => {
  const { username: currentUsername } = useParams<{ username: string }>();
  const location = useLocation<{ newUsername: string; success: boolean }>();
  const history = useHistory();

  const { data: profile, refetch: refreshProfile } = useProfile();
  const { data: user } = useAccountUser(currentUsername ?? '');

  const queryClient = useQueryClient();

  const [error, setError] = React.useState<string | undefined>();
  const [username, setUsername] = React.useState<string>('');
  const [createdUsername, setCreatedUsername] = React.useState<
    string | undefined
  >();
  const [originalUsername, setOriginalUsername] = React.useState<
    string | undefined
  >();
  const [originalEmail, setOriginalEmail] = React.useState<
    string | undefined
  >();
  const [email, setEmail] = React.useState<string | undefined>('');
  const [restricted, setRestricted] = React.useState<boolean>(false);

  const [accountSaving, setAccountSaving] = React.useState<boolean>(false);
  const [accountSuccess, setAccountSuccess] = React.useState<boolean>(false);
  const [accountErrors, setAccountErrors] = React.useState<
    APIError[] | undefined
  >();
  const [profileSaving, setProfileSaving] = React.useState<boolean>(false);
  const [profileSuccess, setProfileSuccess] = React.useState<boolean>(false);
  const [profileErrors, setProfileErrors] = React.useState<
    APIError[] | undefined
  >();

  const tabs = [
    /* NB: These must correspond to the routes inside the Switch */
    {
      routeName: `/account/users/${currentUsername}/profile`,
      title: 'User Profile',
    },
    {
      routeName: `/account/users/${currentUsername}/permissions`,
      title: 'User Permissions',
    },
  ];

  React.useEffect(() => {
    getUser(currentUsername)
      .then((user) => {
        setOriginalUsername(user.username);
        setUsername(user.username);
        setOriginalEmail(user.email);
        setEmail(user.email);
        setRestricted(user.restricted);
      })
      .catch((errorResponse) => {
        setError(
          getAPIErrorOrDefault(errorResponse, 'Error loading user data.')[0]
            .reason
        );
      });

    if (location.state) {
      setAccountSuccess(clone(location.state.success));
      setCreatedUsername(clone(location.state.newUsername));
      history.replace({
        pathname: history.location.pathname,
        state: {},
      });
    }
  }, []);

  const clearNewUser = () => {
    setCreatedUsername(undefined);
  };

  const handleChangeUsername = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setUsername(e.target.value);
  };

  const handleChangeEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSaveAccount = () => {
    if (!originalUsername) {
      return;
    }

    setAccountSuccess(false);
    setAccountSaving(true);
    setAccountErrors([]);
    setProfileSuccess(false);
    setProfileErrors([]);

    updateUser(originalUsername, { restricted, username })
      .then((user) => {
        /**
         * Update the state of the component with the updated information.
         */
        setOriginalUsername(user.username);
        setUsername(user.username);
        setAccountSaving(false);
        setAccountErrors(undefined);

        /**
         * If the user we updated is the current user, we need to reflect that change at the global level.
         * Otherwise, refetch the account's users so it has the new username
         */
        if (profile?.username === originalUsername) {
          refreshProfile();
        } else {
          queryClient.invalidateQueries([queryKey, 'users']);
        }

        history.replace(`/account/users/${user.username}`, {
          success: true,
        });
      })
      .catch((errResponse) => {
        setAccountErrors(
          getAPIErrorOrDefault(errResponse, 'Error updating username')
        );
        setAccountSaving(false);
        setAccountSuccess(false);
      });
  };

  const handleSaveProfile = () => {
    setProfileSuccess(false);
    setProfileSaving(true);
    setProfileErrors([]);
    setAccountSuccess(false);
    setAccountErrors([]);

    updateProfile({ email })
      .then((profile) => {
        setProfileSaving(false);
        setProfileSuccess(true);
        setProfileErrors(undefined);
        /**
         * If the user we updated is the current user, we need to reflect that change at the global level.
         */
        if (profile.username === originalUsername) {
          refreshProfile();
        }
      })
      .catch((errResponse) => {
        setProfileErrors(
          getAPIErrorOrDefault(errResponse, 'Error updating email')
        );
        setProfileSaving(false);
        setProfileSuccess(false);
      });
  };

  const matches = (p: string) => {
    return Boolean(matchPath(p, { path: location.pathname }));
  };

  const navToURL = (index: number) => {
    history.push(tabs[index].routeName);
  };

  const isProxyUser = user?.user_type === 'proxy';

  if (error) {
    return (
      <React.Fragment>
        <LandingHeader title={username || ''} />
        <ErrorState errorText={error} />
      </React.Fragment>
    );
  }

  return (
    <>
      <LandingHeader
        breadcrumbProps={{
          labelOptions: {
            noCap: true,
          },
          pathname: location.pathname,
        }}
        removeCrumbX={4}
        title={username}
      />
      <Tabs
        index={Math.max(
          tabs.findIndex((tab) => matches(tab.routeName)),
          0
        )}
        onChange={navToURL}
      >
        {!isProxyUser && <TabLinkList tabs={tabs} />}

        {createdUsername && (
          <Notice
            text={`User ${createdUsername} created successfully`}
            variant="success"
          />
        )}
        <TabPanels>
          <SafeTabPanel index={0}>
            <UserProfile
              accountErrors={accountErrors}
              accountSaving={accountSaving}
              accountSuccess={accountSuccess || false}
              changeEmail={handleChangeEmail}
              changeUsername={handleChangeUsername}
              email={email}
              originalEmail={originalEmail}
              originalUsername={originalUsername}
              profileErrors={profileErrors}
              profileSaving={profileSaving}
              profileSuccess={profileSuccess || false}
              saveAccount={handleSaveAccount}
              saveProfile={handleSaveProfile}
              username={username}
            />
          </SafeTabPanel>
          <SafeTabPanel index={1}>
            <UserPermissions
              accountUsername={profile?.username}
              clearNewUser={clearNewUser}
              currentUsername={username}
              queryClient={queryClient}
            />
          </SafeTabPanel>
        </TabPanels>
      </Tabs>
    </>
  );
};
