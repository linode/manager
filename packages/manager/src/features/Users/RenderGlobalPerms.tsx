import { updateGrants } from '@linode/api-v4/lib/account';
import { APIError } from '@linode/api-v4/lib/types';
import Grid from '@mui/material/Unstable_Grid2';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { Divider } from 'src/components/Divider';
import { FormControlLabel } from 'src/components/FormControlLabel';
import { Paper } from 'src/components/Paper';
import { Toggle } from 'src/components/Toggle';
import { Typography } from 'src/components/Typography';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';

import { RenderBillingPerm } from './RenderBillingPerm';
import { TabInfo } from './UserPermissions';
import { renderActions } from './UserPermissions';
import { Action, UserGrantsState } from './userPermissionsReducer';
import {
  getTabInformation,
  globalBooleanPerms,
  permDescriptionMap,
} from './userPermissionsUtils';

interface RenderGlobalPermsProps {
  cancelPermsType: (str: string) => void;
  clearNewUser: () => void;
  dispatch: React.Dispatch<Action>;
  setErrors: React.Dispatch<React.SetStateAction<APIError[] | undefined>>;
  setTabInfo: React.Dispatch<React.SetStateAction<TabInfo | undefined>>;
  state: UserGrantsState;
  username?: string;
}

export const RenderGlobalPerms = (props: RenderGlobalPermsProps) => {
  const {
    cancelPermsType,
    clearNewUser,
    dispatch,
    setErrors,
    setTabInfo,
    state,
    username,
  } = props;

  const [isSavingGlobal, setIsSavingGlobal] = React.useState<boolean>(false);

  const { enqueueSnackbar } = useSnackbar();

  const savePermsType = (type: string) => {
    setErrors(undefined);
    if (!username || !state.grants?.[type]) {
      return setErrors([
        {
          reason: `Can\'t set ${type} permissions at this time. Please try again later`,
        },
      ]);
    }

    clearNewUser();

    if (type === 'global') {
      setIsSavingGlobal(true);
      updateGrants(username, { global: state.grants['global'] })
        .then((grantsResponse) => {
          // In the chance a new type entity was added to the account, re-calculate what tabs need to be shown.
          const { showTabs, tabs } = getTabInformation(grantsResponse);
          setTabInfo({ showTabs, tabs });
          setIsSavingGlobal(false);
          dispatch({
            savedGlobalPerms: grantsResponse['global'],
            type: 'GLOBAL_PERMS_SAVED',
          });
          enqueueSnackbar('Successfully saved global permissions', {
            variant: 'success',
          });
        })
        .catch((errResponse) => {
          setIsSavingGlobal(false);
          setErrors(
            getAPIErrorOrDefault(
              errResponse,
              'Error while updating global permissions for this user. Please try again later.'
            )
          );
          scrollErrorIntoView();
        });
    }

    // This is where individual entity saving could be implemented
  };

  const renderGlobalPerm = () => {
    // filtering out cancel_account because we're not observing this permission in Cloud or APIv4.
    // Either the user is unrestricted and can cancel the account or is restricted and cannot cancel.
    const filteredGlobalBoolPerms = globalBooleanPerms.filter(
      (eachPerm) => eachPerm !== 'cancel_account'
    );

    const globalPermOnChange = (perm: string) => (
      e: React.ChangeEvent<HTMLInputElement>
    ) => {
      dispatch({
        changedGlobalPerm: perm,
        type: 'GLOBAL_PERM_CHANGED',
        value: e.target.checked,
      });
    };

    return (
      <>
        {filteredGlobalBoolPerms.map((perm) => {
          return (
            <Grid
              sx={(theme) => ({
                padding: `${theme.spacing(0)} ${theme.spacing(1)}`,
              })}
              key={perm}
              sm={6}
              xs={12}
            >
              <FormControlLabel
                control={
                  <Toggle
                    checked={state.grants?.['global'][perm] as boolean}
                    data-qa-global-permission={perm}
                    onChange={globalPermOnChange(perm)}
                  />
                }
                label={permDescriptionMap[perm]}
                sx={(theme) => ({ padding: `${theme.spacing(1)} 0` })}
              />
              <Divider />
            </Grid>
          );
        })}
      </>
    );
  };

  return (
    <Paper
      data-qa-global-section
      sx={(theme) => ({ marginTop: theme.spacing(2) })}
    >
      <Typography data-qa-permissions-header="Global Permissions" variant="h2">
        Global Permissions
      </Typography>
      <Grid
        sx={(theme) => ({
          marginTop: theme.spacing(2),
          paddingBottom: 0,
        })}
        container
        spacing={2}
      >
        {state.grants?.['global'] && renderGlobalPerm()}
      </Grid>
      <RenderBillingPerm dispatch={dispatch} state={state} />
      {renderActions(
        () => savePermsType('global'),
        () => cancelPermsType('global'),
        isSavingGlobal
      )}
    </Paper>
  );
};
