import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';

import { CircleProgress } from 'src/components/CircleProgress';

import { RenderGlobalPerms } from './RenderGlobalPerms';
import { RenderSpecificPerms } from './RenderSpecificPerms';
import { TabInfo } from './UserPermissions';
import { Action, UserGrantsState } from './userPermissionsReducer';
import { entityPerms } from './userPermissionsUtils';

export interface RenderPermissionsProps {
  clearNewUser: () => void;
  dispatch: React.Dispatch<Action>;
  loadingGrants: boolean;
  setErrors: React.Dispatch<React.SetStateAction<APIError[] | undefined>>;
  setTabInfo: React.Dispatch<React.SetStateAction<TabInfo | undefined>>;
  state: UserGrantsState;
  tabInfo?: TabInfo;
  username?: string;
}

export const RenderPermissions = (props: RenderPermissionsProps) => {
  const {
    clearNewUser,
    dispatch,
    loadingGrants,
    setErrors,
    setTabInfo,
    state,
    tabInfo,
    username,
  } = props;

  const cancelPermsType = (type: string) => {
    if (type === 'global') {
      dispatch({
        resetGlobalPerms: state.originalGrants['global'],
        type: 'GLOBAL_PERMS_RESET',
      });
    } else if (type === 'entity') {
      const resetEntityPermsMap = entityPerms.map((entity) => {
        return [entity, state.originalGrants[entity]];
      });
      const resetEntityPermsObj = Object.fromEntries(resetEntityPermsMap);
      dispatch({
        resetSpecificPerms: { ...state.grants, ...resetEntityPermsObj },
        type: 'SPECIFIC_PERMS_RESET',
      });
    } else {
      return;
    }
  };

  if (loadingGrants) {
    return <CircleProgress />;
  } else {
    return (
      <React.Fragment>
        <RenderGlobalPerms
          cancelPermsType={cancelPermsType}
          clearNewUser={clearNewUser}
          dispatch={dispatch}
          setErrors={setErrors}
          setTabInfo={setTabInfo}
          state={state}
          username={username}
        />
        <RenderSpecificPerms
          cancelPermsType={cancelPermsType}
          dispatch={dispatch}
          setErrors={setErrors}
          setTabInfo={setTabInfo}
          state={state}
          tabInfo={tabInfo}
          username={username}
        />
      </React.Fragment>
    );
  }
};
