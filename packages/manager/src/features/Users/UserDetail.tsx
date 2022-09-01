import { getUser, updateUser } from '@linode/api-v4/lib/account';
import { updateProfile } from '@linode/api-v4/lib/profile';
import { APIError } from '@linode/api-v4/lib/types';
import { clone } from 'ramda';
import * as React from 'react';
import {
  matchPath,
  useHistory,
  useLocation,
  useParams,
} from 'react-router-dom';
import Breadcrumb from 'src/components/Breadcrumb';
import TabPanels from 'src/components/core/ReachTabPanels';
import Tabs from 'src/components/core/ReachTabs';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import SafeTabPanel from 'src/components/SafeTabPanel';
import TabLinkList from 'src/components/TabLinkList';
import { queryKey } from 'src/queries/accountUsers';
import { queryClient } from 'src/queries/base';
import { useProfile } from 'src/queries/profile';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import UserPermissions from './UserPermissions';
import UserProfile from './UserProfile';

const UserDetail: React.FC = () => {
  const { username: usernameParam } = useParams<{ username: string }>();
  const location = useLocation<{ newUsername: string; success: boolean }>();
  const history = useHistory();

  const { data: profile, refetch: refreshProfile } = useProfile();

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
      title: 'User Profile',
      routeName: `/account/users/${usernameParam}/profile`,
    },
    {
      title: 'User Permissions',
      routeName: `/account/users/${usernameParam}/permissions`,
    },
  ];

  React.useEffect(() => {
    getUser(usernameParam)
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

  const onChangeUsername = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  const onChangeEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const onSaveAccount = () => {
    if (!originalUsername) {
      return;
    }

    setAccountSuccess(false);
    setAccountSaving(true);
    setAccountErrors([]);
    setProfileSuccess(false);
    setProfileErrors([]);

    updateUser(originalUsername, { username, restricted })
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
          queryClient.invalidateQueries(queryKey);
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

  const onSaveProfile = () => {
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

  if (error) {
    return (
      <React.Fragment>
        <Grid container justifyContent="space-between">
          <Grid item>
            <Breadcrumb
              pathname={location.pathname}
              labelTitle={username || ''}
            />
          </Grid>
        </Grid>
        <ErrorState errorText={error} />
      </React.Fragment>
    );
  }

  return (
    <>
      <Breadcrumb
        pathname={location.pathname}
        labelTitle={username}
        labelOptions={{
          noCap: true,
        }}
        crumbOverrides={[
          {
            position: 2,
            label: 'Users',
            linkTo: {
              pathname: `/account/users`,
            },
          },
        ]}
        removeCrumbX={4}
      />
      <Tabs
        index={Math.max(
          tabs.findIndex((tab) => matches(tab.routeName)),
          0
        )}
        onChange={navToURL}
      >
        <TabLinkList tabs={tabs} />

        {createdUsername && (
          <Notice
            success
            text={`User ${createdUsername} created successfully`}
          />
        )}
        <TabPanels>
          <SafeTabPanel index={0}>
            <UserProfile
              username={username}
              email={email}
              changeUsername={onChangeUsername}
              changeEmail={onChangeEmail}
              saveAccount={onSaveAccount}
              accountSaving={accountSaving}
              accountSuccess={accountSuccess || false}
              accountErrors={accountErrors}
              saveProfile={onSaveProfile}
              profileSaving={profileSaving}
              profileSuccess={profileSuccess || false}
              profileErrors={profileErrors}
              originalUsername={originalUsername}
              originalEmail={originalEmail}
            />
          </SafeTabPanel>
          <SafeTabPanel index={1}>
            <UserPermissions
              currentUser={profile?.username}
              username={username}
              clearNewUser={clearNewUser}
            />
          </SafeTabPanel>
        </TabPanels>
      </Tabs>
    </>
  );
};

export default UserDetail;
