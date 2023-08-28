import { getGrants, updateUser } from '@linode/api-v4/lib/account';
import { APIError } from '@linode/api-v4/lib/types';
import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';
import { useImmerReducer } from 'use-immer';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { CircleProgress } from 'src/components/CircleProgress';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { Notice } from 'src/components/Notice/Notice';
import { Toggle } from 'src/components/Toggle';
import { Typography } from 'src/components/Typography';
import {
  WithQueryClientProps,
  withQueryClient,
} from 'src/containers/withQueryClient.container';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';

import { RenderPermissions } from './RenderPermissions';
import { RenderUnrestricted } from './RenderUnrestricted';
import {
  Action,
  UserGrantsState,
  initialState,
  userGrantsReducer,
} from './userPermissionsReducer';
import { getTabInformation } from './userPermissionsUtils';

interface Props {
  clearNewUser: () => void;
  currentUser?: string;
  username?: string;
}

export interface TabInfo {
  showTabs: boolean;
  tabs: string[];
}

type CombinedProps = Props & WithQueryClientProps;

export const UserPermissions = withQueryClient(
  ({ clearNewUser, currentUser, queryClient, username }: CombinedProps) => {
    const [loading, setLoading] = React.useState<boolean>(true);
    const [loadingGrants, setLoadingGrants] = React.useState<boolean>(false);
    const [errors, setErrors] = React.useState<APIError[] | undefined>();
    // need this separated so we can show just the restricted toggle when it's in use
    const [restricted, setRestricted] = React.useState<boolean | undefined>();
    // Large Account Support
    const [tabInfo, setTabInfo] = React.useState<TabInfo>();

    const [state, dispatch] = useImmerReducer<UserGrantsState, Action>(
      userGrantsReducer,
      initialState
    );

    const hasErrorFor = getAPIErrorsFor({ restricted: 'Restricted' }, errors);
    const generalError = hasErrorFor('none');

    React.useEffect(() => {
      const getUserGrants = async () => {
        try {
          if (username) {
            const grants = await getGrants(username);

            if (grants.global) {
              const { showTabs, tabs } = getTabInformation(grants);
              setTabInfo({ showTabs, tabs });
              setLoading(false);
              setLoadingGrants(false);
              setRestricted(true);
              dispatch({ grants, type: 'GRANTS_SET' });
              dispatch({ originalGrants: grants, type: 'ORIGINAL_GRANTS_SET' });
            } else {
              setLoading(false);
              setLoadingGrants(false);
              setRestricted(false);
              dispatch({ grants, type: 'GRANTS_SET' });
            }
          }
        } catch (errResponse) {
          setErrors(
            getAPIErrorOrDefault(
              errResponse,
              'Unknown error occurred while fetching user permissions. Try again later.'
            )
          );
          scrollErrorIntoView();
        }
      };

      getUserGrants();
    }, [username, dispatch]);

    const onChangeRestricted = () => {
      setErrors([]);
      setLoadingGrants(true);
      if (username) {
        updateUser(username, { restricted: !restricted })
          .then((user) => {
            setRestricted(user.restricted);
          })
          .then(() => {
            // refresh the data on /account/users so it is accurate
            queryClient.invalidateQueries('account-users');
          })
          .catch((errResponse) => {
            setLoadingGrants(false);
            setErrors(
              getAPIErrorOrDefault(
                errResponse,
                'Error when updating user restricted status. Please try again later.'
              )
            );
          });
      }
    };

    return (
      <React.Fragment>
        <DocumentTitleSegment segment={`${username} - Permissions`} />
        {loading ? (
          <CircleProgress />
        ) : (
          <React.Fragment>
            {generalError ? (
              <Notice spacingTop={8} text={generalError} variant="error" />
            ) : null}
            <Grid
              alignItems="center"
              container
              spacing={2}
              style={{ width: 'auto' }}
            >
              <Grid>
                <Typography
                  sx={(theme) => ({
                    [theme.breakpoints.down('md')]: {
                      paddingLeft: theme.spacing(),
                    },
                  })}
                  data-qa-restrict-access={restricted}
                  variant="h2"
                >
                  Full Account Access:
                </Typography>
              </Grid>
              <Grid>
                <Typography variant="h2">
                  {!restricted ? 'On' : 'Off'}
                </Typography>
              </Grid>
              <Grid>
                <Toggle
                  tooltipText={
                    username === currentUser
                      ? 'You cannot restrict the current active user.'
                      : ''
                  }
                  checked={!restricted}
                  disabled={username === currentUser}
                  onChange={onChangeRestricted}
                  sx={{ marginRight: 3 }}
                />
              </Grid>
            </Grid>
            {!restricted ? (
              <RenderUnrestricted />
            ) : (
              <RenderPermissions
                clearNewUser={clearNewUser}
                dispatch={dispatch}
                loadingGrants={loadingGrants}
                setErrors={setErrors}
                setTabInfo={setTabInfo}
                state={state}
                tabInfo={tabInfo}
                username={username}
              />
            )}
          </React.Fragment>
        )}
      </React.Fragment>
    );
  }
);

export const renderActions = (
  onConfirm: () => void,
  onCancel: () => void,
  loading: boolean
) => {
  return (
    <ActionsPanel
      primaryButtonProps={{
        'data-testid': 'submit',
        label: 'Save',
        loading,
        onClick: onConfirm,
      }}
      secondaryButtonProps={{
        'data-testid': 'cancel',
        label: 'Reset',
        onClick: onCancel,
      }}
      sx={(theme) => ({
        marginTop: theme.spacing(2),
        paddingBottom: 0,
      })}
      alignItems="center"
      display="flex"
      justifyContent="flex-end"
    />
  );
};
